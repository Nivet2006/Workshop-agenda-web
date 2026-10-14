import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { ExternalLink } from 'lucide-react';

export interface Speaker {
  id: string;
  name: string;
  linkedinUrl: string;
}

export interface NetworkProfile {
  id: string;
  name: string;
  subtitle?: string;
  linkedinUrl: string;
}

export const ORGANIZATION: NetworkProfile = {
  id: 'org-1',
  name: 'One Percent Club',
  subtitle: 'Official Organization',
  linkedinUrl: 'https://www.linkedin.com/in/theonepercentclub/'
};

export const SPEAKERS: NetworkProfile[] = [
  {
    id: 'sp-1',
    name: 'Nived Shaji',
    subtitle: 'Speaker',
    linkedinUrl: 'https://www.linkedin.com/in/nivet2006/'
  },
  {
    id: 'sp-2',
    name: 'Nithesh V',
    subtitle: 'Speaker',
    linkedinUrl: 'https://www.linkedin.com/in/nitheshvinod/'
  }
];

export const ALL_NETWORKING_PROFILES: NetworkProfile[] = [
  ORGANIZATION,
  ...SPEAKERS
];

export function SpeakerNetworking() {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    ALL_NETWORKING_PROFILES.forEach(async (sp) => {
      try {
        const dataUrl = await QRCode.toDataURL(sp.linkedinUrl, {
          width: 360,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });
        setQrCodes(prev => ({ ...prev, [sp.id]: dataUrl }));
      } catch (err) {
        console.error(`Failed to generate QR for ${sp.name}:`, err);
        setQrCodes(prev => ({
          ...prev,
          [sp.id]: `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(sp.linkedinUrl)}`
        }));
      }
    });
  }, []);

  return (
    <div className="my-8 flex flex-col items-center w-full">
      {/* One Percent Club Card (Positioned Above Speakers) */}
      <div className="w-full max-w-sm mb-10 flex flex-col items-center">
        <a
          href={ORGANIZATION.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex flex-col items-center p-6 sm:p-8 bg-[#111111] border border-[#242424] hover:border-[#444444] rounded-2xl transition-all duration-200 group shadow-lg hover:shadow-2xl hover:scale-[1.02]"
          title={`Open ${ORGANIZATION.name}'s LinkedIn Profile`}
        >
          {/* Plain QR with centered LinkedIn Logo */}
          <div className="relative inline-block p-4 bg-white rounded-2xl shadow-xl">
            {qrCodes[ORGANIZATION.id] ? (
              <img
                src={qrCodes[ORGANIZATION.id]}
                alt={`QR Code for ${ORGANIZATION.name}`}
                className="w-48 h-48 md:w-56 md:h-56 block object-contain rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 md:w-56 md:h-56 bg-zinc-100 rounded-lg animate-pulse" />
            )}

            {/* LinkedIn Logo Badge in the exact center of the QR */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center border border-zinc-200">
              <svg className="w-full h-full text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </div>
          </div>

          <h3 className="mt-5 text-xl md:text-2xl font-bold text-white tracking-tight text-center group-hover:text-[#FF5722] transition-colors">
            {ORGANIZATION.name}
          </h3>
          <span className="mt-1 text-xs font-mono text-[#888888] uppercase tracking-wider">
            Organization
          </span>
          <span className="mt-2 text-[11px] font-mono text-[#666666] group-hover:text-[#A1A1A1] transition-colors flex items-center gap-1">
            <span>Click to open profile</span>
            <ExternalLink size={10} className="text-[#0077b5]" />
          </span>
        </a>
      </div>

      {/* Speakers Grid: Nived Shaji & Nithesh V */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 w-full max-w-3xl justify-items-center">
        {SPEAKERS.map((speaker) => {
          const qrSrc = qrCodes[speaker.id];

          return (
            <a
              key={speaker.id}
              href={speaker.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 sm:p-8 bg-[#111111] border border-[#242424] hover:border-[#444444] rounded-2xl transition-all duration-200 group shadow-lg hover:shadow-2xl hover:scale-[1.02]"
              title={`Open ${speaker.name}'s LinkedIn Profile`}
            >
              {/* Plain QR with centered LinkedIn Logo */}
              <div className="relative inline-block p-4 bg-white rounded-2xl shadow-xl">
                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt={`QR Code for ${speaker.name}`}
                    className="w-48 h-48 md:w-56 md:h-56 block object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 md:w-56 md:h-56 bg-zinc-100 rounded-lg animate-pulse" />
                )}

                {/* LinkedIn Logo Badge in the exact center of the QR */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center border border-zinc-200">
                  <svg className="w-full h-full text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
              </div>

              {/* Just Name */}
              <h3 className="mt-5 text-xl md:text-2xl font-bold text-white tracking-tight text-center group-hover:text-[#FF5722] transition-colors">
                {speaker.name}
              </h3>
              <span className="mt-1 text-xs font-mono text-[#888888] uppercase tracking-wider">
                Speaker
              </span>
              <span className="mt-2 text-[11px] font-mono text-[#666666] group-hover:text-[#A1A1A1] transition-colors flex items-center gap-1">
                <span>Click to open profile</span>
                <ExternalLink size={10} className="text-[#0077b5]" />
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
