declare global {
    interface Window {
        PayChangu: new () => PayChanguInstance;
    }
}

interface PayChanguConfig {
    public_key: string;
    tx_ref: string;
    amount: number;
    currency: string;
    email: string;
    first_name: string;
    last_name: string;
    callback_url: string;
    return_url: string;
    customization?: {
        title?: string;
        description?: string;
        logo?: string;
    };
    meta?: Record<string, any>;
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
    onClose?: () => void;
}

interface PayChanguInstance {
    open(config: PayChanguConfig): void;
}

export {};
