<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'address_line_1',
        'address_line_2',
        'village',
        'commune',
        'district',
        'province',
        'postal_code',
        'country',
        'delivery_notes',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFormattedAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address_line_1,
            $this->address_line_2,
            $this->village ? "Phum {$this->village}" : null,
            $this->commune ? "Sangkat {$this->commune}" : null,
            $this->district ? "Khan {$this->district}" : null,
            $this->province,
            $this->country,
        ]);

        return implode(', ', $parts);
    }
}
