<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ChildrenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $children = [
            [
                'first_name' => 'Chisomo',
                'last_name' => 'Phiri',
                'name' => 'Chisomo Phiri',
                'age' => 12,
                'date_of_birth' => '2012-03-15',
                'gender' => 'female',
                'location' => 'Lilongwe',
                'school' => 'Lilongwe Primary School',
                'grade' => 'Standard 6',
                'story' => 'Chisomo is a bright and enthusiastic student who loves mathematics and dreams of becoming a teacher. She lives with her grandmother and helps take care of her younger siblings.',
                'health_status' => 'Good',
                'academic_performance' => 85,
                'favorite_subjects' => 'Mathematics, English, Science',
                'dreams' => 'To become a teacher and help other children learn',
                'hobbies' => 'Reading, drawing, playing netball',
                'guardian_name' => 'Mary Phiri',
                'guardian_contact' => '+265 888 123 456',
                'education_level' => 'Primary',
                'image' => '/storage/children/10oSvvqiSmIWurhletsoRQrbX3yPTNl4r01QVEHE.png',
                'photo' => '10oSvvqiSmIWurhletsoRQrbX3yPTNl4r01QVEHE.png',
            ],
            [
                'first_name' => 'Thandiwe',
                'last_name' => 'Mwale',
                'name' => 'Thandiwe Mwale',
                'age' => 14,
                'date_of_birth' => '2010-07-22',
                'gender' => 'female',
                'location' => 'Mzuzu',
                'school' => 'Mzuzu Secondary School',
                'grade' => 'Form 2',
                'story' => 'Thandiwe is an excellent student with a passion for science. She wants to become a doctor to help her community. She is the eldest of four children.',
                'health_status' => 'Excellent',
                'academic_performance' => 92,
                'favorite_subjects' => 'Biology, Chemistry, Mathematics',
                'dreams' => 'To become a doctor and open a clinic in my village',
                'hobbies' => 'Reading medical books, playing football, singing',
                'guardian_name' => 'James Mwale',
                'guardian_contact' => '+265 999 234 567',
                'education_level' => 'Secondary',
                'image' => '/storage/children/G9n8L4CBbhcUxY7kPQ0OiTAcqXglTzIKgl2qS2md.png',
                'photo' => 'G9n8L4CBbhcUxY7kPQ0OiTAcqXglTzIKgl2qS2md.png',
            ],
            [
                'first_name' => 'Mphatso',
                'last_name' => 'Banda',
                'name' => 'Mphatso Banda',
                'age' => 10,
                'date_of_birth' => '2014-11-08',
                'gender' => 'male',
                'location' => 'Blantyre',
                'school' => 'Blantyre Community School',
                'grade' => 'Standard 4',
                'story' => 'Mphatso is a creative and energetic boy who loves art and building things. He dreams of becoming an engineer to build better houses for his community.',
                'health_status' => 'Good',
                'academic_performance' => 78,
                'favorite_subjects' => 'Mathematics, Art, Physical Education',
                'dreams' => 'To become an engineer and build schools and hospitals',
                'hobbies' => 'Drawing, building with blocks, playing football',
                'guardian_name' => 'Grace Banda',
                'guardian_contact' => '+265 777 345 678',
                'education_level' => 'Primary',
                'image' => '/storage/children/HkAM7Xh3FAKZrVGz92xhUSXsjEYfv6HaJUmR4iGD.png',
                'photo' => 'HkAM7Xh3FAKZrVGz92xhUSXsjEYfv6HaJUmR4iGD.png',
            ],
        ];

        foreach ($children as $child) {
            \App\Models\Child::create($child);
        }
    }
}
