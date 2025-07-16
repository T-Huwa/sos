<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->string('location')->nullable()->after('gender');
            $table->string('school')->nullable()->after('location');
            $table->string('grade')->nullable()->after('school');
            $table->text('story')->nullable()->after('grade');
            $table->string('photo')->nullable()->after('story');
            $table->integer('age')->nullable()->after('date_of_birth');
            $table->string('name')->nullable()->after('last_name'); // Computed field for full name
            $table->integer('academic_performance')->nullable()->after('education_level');
            $table->string('last_health_checkup')->nullable()->after('health_status');
            $table->string('favorite_subjects')->nullable()->after('academic_performance');
            $table->text('dreams')->nullable()->after('favorite_subjects');
            $table->text('hobbies')->nullable()->after('dreams');
            $table->string('guardian_name')->nullable()->after('hobbies');
            $table->string('guardian_contact')->nullable()->after('guardian_name');
            $table->text('medical_conditions')->nullable()->after('guardian_contact');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropColumn([
                'location', 'school', 'grade', 'story', 'photo', 'age', 'name',
                'academic_performance', 'last_health_checkup', 'favorite_subjects',
                'dreams', 'hobbies', 'guardian_name', 'guardian_contact', 'medical_conditions'
            ]);
        });
    }
};
