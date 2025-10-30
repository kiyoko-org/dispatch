export type NationalIdData = {
  data: {
    best_finger_captured: string[];
    birth_date: string;
    date_issued: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    pcn: string;
    place_of_birth: string;
    sex: string;
    suffix?: string;
  };
  meta: {
    qr_type: string;
  };
};

export type VerifyQRResult = {
  isVerified: boolean;
  data: NationalIdData | null;
};

export async function verifyNationalIdQR(data: string): Promise<VerifyQRResult> {
  try {
    const response = await fetch('https://dispatch-auth.stvndvmrnd.workers.dev/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: data,
    });

    if (!response.ok) {
      return { isVerified: false, data: null };
    }

    const json = await response.json();
    return {
      isVerified: !!json.isVerified,
      data: json.data ?? null,
    };
  } catch (err) {
    console.error('id-client verify error', err);
    return { isVerified: false, data: null };
  }
}
