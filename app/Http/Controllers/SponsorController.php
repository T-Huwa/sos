<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Sponsorship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SponsorController extends Controller
{
    public function browseChildren(Request $request)
    {
        $user = Auth::user();
        
        // Get children that are not currently sponsored or available for sponsorship
        $query = Child::with(['sponsorships' => function($q) {
            $q->where('active', true);
        }])
        ->whereDoesntHave('sponsorships', function($q) {
            $q->where('active', true);
        })
        ->orWhereHas('sponsorships', function($q) use ($user) {
            $q->where('active', true)->where('user_id', $user->id);
        });

        // Apply filters
        if ($request->has('age_min') && $request->age_min) {
            $query->where('age', '>=', $request->age_min);
        }

        if ($request->has('age_max') && $request->age_max) {
            $query->where('age', '<=', $request->age_max);
        }

        if ($request->has('gender') && $request->gender !== 'all') {
            $query->where('gender', $request->gender);
        }

        if ($request->has('location') && $request->location !== 'all') {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('story', 'like', '%' . $request->search . '%')
                  ->orWhere('school', 'like', '%' . $request->search . '%');
            });
        }

        $children = $query->paginate(12);

        // Get current user's sponsorships
        $mySponsorship = Sponsorship::where('user_id', $user->id)
            ->where('active', true)
            ->with('child')
            ->get();

        // Get filter options
        $locations = Child::distinct('location')->pluck('location')->filter()->values();
        $ageRange = [
            'min' => Child::min('age') ?? 5,
            'max' => Child::max('age') ?? 18
        ];

        return Inertia::render('sponsor/children', [
            'children' => $children,
            'mySponsorship' => $mySponsorship,
            'filters' => [
                'locations' => $locations,
                'ageRange' => $ageRange,
                'current' => $request->only(['age_min', 'age_max', 'gender', 'location', 'search'])
            ]
        ]);
    }

    public function showChild($id)
    {
        $user = Auth::user();

        $child = Child::with(['sponsorships' => function($q) {
            $q->where('active', true)->with('sponsor');
        }])->findOrFail($id);

        // Check if current user is already sponsoring this child
        $isSponsoring = Sponsorship::where('user_id', $user->id)
            ->where('child_id', $child->id)
            ->where('active', true)
            ->exists();

        // Check if child is available for sponsorship
        $isAvailable = !$child->sponsorships->where('active', true)->count() || $isSponsoring;

        // Add sample progress data for demonstration
        $child->academic_performance = $child->academic_performance ?? rand(70, 95);
        $child->health_status = $child->health_status ?? collect(['Excellent', 'Good', 'Fair'])->random();
        $child->last_health_checkup = $child->last_health_checkup ?? now()->subDays(rand(30, 90))->format('Y-m-d');
        $child->favorite_subjects = $child->favorite_subjects ?? 'Mathematics, English, Science';
        $child->dreams = $child->dreams ?? 'To become a doctor and help people in my community';
        $child->hobbies = $child->hobbies ?? 'Reading, playing football, drawing';
        $child->guardian_name = $child->guardian_name ?? 'Mary ' . $child->name;
        $child->guardian_contact = $child->guardian_contact ?? '+265 ' . rand(100000000, 999999999);

        return Inertia::render('sponsor/child', [
            'child' => $child,
            'isSponsoring' => $isSponsoring,
            'isAvailable' => $isAvailable,
            'currentSponsor' => $child->sponsorships->where('active', true)->first()?->sponsor
        ]);
    }

    public function sponsorChild(Request $request, $id)
    {
        $user = Auth::user();
        $child = Child::findOrFail($id);

        // Validate that user can sponsor this child
        $existingSponsorship = Sponsorship::where('user_id', $user->id)
            ->where('child_id', $child->id)
            ->where('active', true)
            ->first();

        if ($existingSponsorship) {
            return back()->with('error', 'You are already sponsoring this child.');
        }

        // Check if child is already sponsored by someone else
        $activeSponsorship = Sponsorship::where('child_id', $child->id)
            ->where('active', true)
            ->first();

        if ($activeSponsorship) {
            return back()->with('error', 'This child is already being sponsored by someone else.');
        }

        try {
            DB::beginTransaction();

            // Create sponsorship
            Sponsorship::create([
                'user_id' => $user->id,
                'child_id' => $child->id,
                'start_date' => now(),
                'active' => true
            ]);

            DB::commit();

            return redirect()->route('sponsor.my-sponsorships')
                ->with('success', "You are now sponsoring {$child->name}! Thank you for making a difference.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create sponsorship. Please try again.');
        }
    }

    public function mySponsorship()
    {
        $user = Auth::user();

        $sponsorships = Sponsorship::where('user_id', $user->id)
            ->where('active', true)
            ->with(['child'])
            ->get();

        // Add sample progress data for each sponsored child
        $sponsorships->each(function($sponsorship) {
            $child = $sponsorship->child;
            $child->academic_performance = $child->academic_performance ?? rand(70, 95);
            $child->health_status = $child->health_status ?? collect(['Excellent', 'Good', 'Fair'])->random();
            $child->last_health_checkup = $child->last_health_checkup ?? now()->subDays(rand(30, 90))->format('Y-m-d');
            $child->favorite_subjects = $child->favorite_subjects ?? 'Mathematics, English, Science';
            $child->dreams = $child->dreams ?? 'To become a doctor and help people in my community';
            $child->hobbies = $child->hobbies ?? 'Reading, playing football, drawing';
        });

        // Calculate statistics
        $stats = [
            'total_sponsored' => $sponsorships->count(),
            'total_contributed' => 0, // This would come from donations if implemented
            'sponsorship_duration' => $sponsorships->min('start_date') ?
                now()->diffInMonths($sponsorships->min('start_date')) : 0,
        ];

        return Inertia::render('sponsor/my-sponsorships', [
            'sponsorships' => $sponsorships,
            'stats' => $stats
        ]);
    }
}
