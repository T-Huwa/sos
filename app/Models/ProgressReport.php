<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProgressReport extends Model
{
    use HasFactory;

    protected $fillable = ['child_id', 'report_type', 'content', 'report_date'];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }
}
