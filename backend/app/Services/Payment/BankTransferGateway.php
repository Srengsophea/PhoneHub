<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Str;

class BankTransferGateway implements PaymentGatewayInterface
{
    public function process(Order $order, array $paymentData = []): array
    {
        $refNumber = 'KHQR-' . strtoupper(Str::random(8));

        $khqrPayload = $this->generateKHQRPayload((float)$order->total_amount, $order->order_number);

        $payment = Payment::create([
            'order_id' => $order->id,
            'transaction_id' => $refNumber,
            'provider' => 'khqr',
            'amount' => $order->total_amount,
            'currency' => 'USD',
            'status' => 'pending',
            'payload' => [
                'bank_name' => 'Bakong KHQR (All Banks)',
                'account_name' => 'PhoneHub',
                'account_number' => 'sophea_sreng2@bkrt',
                'reference_code' => $order->order_number,
                'bakong_id' => 'sophea_sreng2@bkrt',
                'khqr_payload' => $khqrPayload,
            ],
        ]);

        $order->update([
            'payment_status' => 'pending',
            'payment_method' => 'khqr',
        ]);

        return [
            'success' => true,
            'payment' => $payment,
            'message' => 'Bank transfer details generated. Please complete payment using KHQR.',
            'redirect_url' => null,
            'bank_info' => $payment->payload,
        ];
    }

    public function handleWebhook(array $payload, ?string $signature = null): array
    {
        // For automated bank webhook callbacks (e.g. ABA PayWay webhook)
        $txId = $payload['tran_id'] ?? null;
        if ($txId) {
            $payment = Payment::where('transaction_id', $txId)->first();
            if ($payment) {
                $payment->update([
                    'status' => 'paid',
                    'payload' => array_merge($payment->payload ?? [], ['webhook' => $payload]),
                ]);
                $payment->order->update(['payment_status' => 'paid']);
                $payment->order->addStatusHistory('confirmed', 'Payment received via Bank KHQR.');
                return ['success' => true];
            }
        }
        return ['success' => false, 'message' => 'Payment not found.'];
    }

    private function generateKHQRPayload(float $amount, string $billNumber): string
    {
        $bakongId = 'sophea_sreng2@bkrt';
        $merchantName = 'PhoneHub';
        $city = 'Phnom Penh';

        $tlv = function (string $tag, string $value): string {
            return $tag . str_pad((string)strlen($value), 2, '0', STR_PAD_LEFT) . $value;
        };

        $amtStr = $amount == floor($amount) ? (string)(int)$amount : number_format($amount, 2, '.', '');

        $body = '';
        $body .= $tlv('00', '01');
        $body .= $tlv('01', '12');
        $body .= $tlv('29', $tlv('00', $bakongId));
        $body .= $tlv('52', '5999');
        $body .= $tlv('53', '840');
        $body .= $tlv('54', $amtStr);
        $body .= $tlv('58', 'KH');
        $body .= $tlv('59', substr($merchantName, 0, 25));
        $body .= $tlv('60', substr($city, 0, 15));

        $sub62 = $tlv('01', substr($billNumber, 0, 25)) . $tlv('03', substr($merchantName, 0, 25));
        $body .= $tlv('62', $sub62);

        $nowMs = (int)(microtime(true) * 1000);
        $expMs = $nowMs + 15 * 60 * 1000;
        $sub99 = $tlv('00', (string)$nowMs) . $tlv('01', (string)$expMs);
        $body .= $tlv('99', $sub99);

        $payload = $body . '6304';

        // CRC16-CCITT
        $crc = 0xFFFF;
        for ($i = 0; $i < strlen($payload); $i++) {
            $crc ^= (ord($payload[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                if ($crc & 0x8000) {
                    $crc = (($crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }
        $checksum = strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));

        return $payload . $checksum;
    }
}
