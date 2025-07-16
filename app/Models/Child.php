<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Child extends Model
{
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'first_name', 'last_name', 'image', 'date_of_birth',
        'gender', 'health_status', 'education_level'
    ];

    public function sponsorships()
    {
        return $this->hasMany(Sponsorship::class);
    }

    public function reports()
    {
        return $this->hasMany(ProgressReport::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function donors()
    {
        return $this->hasManyThrough(
            User::class,         // Final model
            Donation::class,     // Intermediate model
            'child_id',          // Foreign key on donations table
            'id',                // Local key on users table (referenced by donations.user_id)
            'id',                // Local key on children table (this model)
            'user_id'            // Foreign key on donations table pointing to users
        );
    }
    
}
