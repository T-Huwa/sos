<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sponsorship extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'child_id', 'start_date', 'end_date', 'active'];

    public function sponsor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function child()
    {
        return $this->belongsTo(Child::class);
    }
}
