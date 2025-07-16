<?php

namespace App\Http\Controllers;

use App\Models\ProgressReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgressReportController extends Controller
{
    public function index()
    {
        return Inertia::render('ProgressReports/Index', [
            'reports' => ProgressReport::with('child')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('ProgressReports/Create');
    }

    public function store(Request $request)
    {
        ProgressReport::create($request->all());

        return redirect()->route('progress-reports.index');
    }

    public function show(ProgressReport $progressReport)
    {
        return Inertia::render('ProgressReports/Show', [
            'report' => $progressReport->load('child'),
        ]);
    }
}
