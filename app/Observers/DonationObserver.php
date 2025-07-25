<?php

namespace App\Observers;

use App\Models\Donation;
use App\Models\DonationCampaign;

class DonationObserver
{
    /**
     * Handle the Donation "created" event.
     */
    public function created(Donation $donation): void
    {
        $this->checkCampaignCompletion($donation);
    }

    /**
     * Handle the Donation "updated" event.
     */
    public function updated(Donation $donation): void
    {
        $this->checkCampaignCompletion($donation);
    }

    /**
     * Handle the Donation "deleted" event.
     */
    public function deleted(Donation $donation): void
    {
        $this->checkCampaignCompletion($donation);
    }

    /**
     * Check if the campaign goal is reached and mark as completed
     */
    private function checkCampaignCompletion(Donation $donation): void
    {
        // Only check for money donations that are received and have a campaign
        if ($donation->donation_type !== 'money' ||
            $donation->status !== 'received' ||
            !$donation->campaign_id) {
            return;
        }

        $campaign = DonationCampaign::find($donation->campaign_id);

        if (!$campaign || !$campaign->target_amount) {
            return;
        }

        // Check if goal is reached
        if ($campaign->is_goal_reached && !$campaign->is_completed) {
            $campaign->update(['is_completed' => true]);
        } elseif (!$campaign->is_goal_reached && $campaign->is_completed) {
            // If goal is no longer reached (e.g., donation was deleted), mark as incomplete
            $campaign->update(['is_completed' => false]);
        }
    }
}
