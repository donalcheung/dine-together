'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ReferralPage() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase() || '';
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [countdown, setCountdown] = useState(5);

  const playStoreLink = `https://play.google.com/store/apps/details?id=com.tablemeshnative&referrer=utm_source%3Dreferral%26utm_content%3D${code}`;
  const appStoreLink = `https://apps.apple.com/us/app/tablemesh/id6760209899`;

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  useEffect(() => {
    // Auto-redirect countdown for mobile
    if (platform === 'desktop') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to the appropriate store
          if (platform === 'android') {
            window.location.href = playStoreLink;
          } else if (platform === 'ios') {
            window.location.href = appStoreLink;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [platform, playStoreLink, appStoreLink]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #faf7f2 0%, #fff7ed 50%, #fef3c7 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍽️</div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '8px',
        }}>
          TableMesh
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '32px',
        }}>
          You&apos;ve been invited to join TableMesh!
        </p>

        {/* Referral Code Card */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #86efac',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '32px',
        }}>
          <p style={{
            fontSize: '12px',
            fontWeight: '800',
            color: '#6b7280',
            letterSpacing: '1px',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            Your Referral Code
          </p>
          <p style={{
            fontSize: '36px',
            fontWeight: '900',
            color: '#15803d',
            letterSpacing: '4px',
          }}>
            {code}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px',
          }}>
            Enter this code when you sign up to get started
          </p>
        </div>

        {/* Platform-specific content */}
        {platform !== 'desktop' && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '14px',
              color: '#9ca3af',
              marginBottom: '16px',
            }}>
              Redirecting to {platform === 'ios' ? 'App Store' : 'Google Play'} in {countdown}s...
            </p>
            <a
              href={platform === 'android' ? playStoreLink : appStoreLink}
              style={{
                display: 'inline-block',
                backgroundColor: '#f97316',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '16px',
                padding: '14px 32px',
                borderRadius: '12px',
                textDecoration: 'none',
              }}
            >
              Download TableMesh
            </a>
          </div>
        )}

        {platform === 'desktop' && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '16px',
              color: '#374151',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              TableMesh connects you with people to dine with at great restaurants.
              Download the app and use the referral code above when you sign up!
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <a
                href={playStoreLink}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                Google Play
              </a>
              <a
                href={appStoreLink}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                App Store
              </a>
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '20px',
          marginTop: '16px',
          border: '1px solid #f3f4f6',
          textAlign: 'left',
        }}>
          <p style={{
            fontSize: '15px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '12px',
          }}>
            How to use your referral code:
          </p>
          {[
            'Download TableMesh from the App Store or Google Play',
            'Create your account with Google or email',
            `Enter the code ${code} during profile setup`,
            'Start discovering dining experiences!',
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginBottom: i < 3 ? '10px' : '0',
            }}>
              <span style={{
                backgroundColor: '#f97316',
                color: '#fff',
                fontWeight: '700',
                fontSize: '12px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{
                fontSize: '14px',
                color: '#4b5563',
                lineHeight: '22px',
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Back to main site */}
        <Link href="/" style={{
          display: 'inline-block',
          marginTop: '24px',
          fontSize: '14px',
          color: '#9ca3af',
          textDecoration: 'none',
        }}>
          Learn more about TableMesh →
        </Link>
      </div>
    </div>
  );
}
