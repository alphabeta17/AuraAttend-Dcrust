import React from 'react';

function NotificationAlert({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '1rem' }}>
        ✨ No schedule updates for today.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {alerts.map((item, index) => {
        const isCancel = item.type === "CANCEL";
        const themeColor = isCancel ? '#ef4444' : '#eab308';
        const bgColor = isCancel ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)';

        return (
          <div key={index} style={{
            background: bgColor,
            border: `1px solid ${themeColor}`,
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'left'
          }}>
            <div style={{ color: themeColor, fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              {isCancel ? '⚠️ LECTURE CANCELED' : '⏳ LECTURE RESCHEDULED'}
            </div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.subject}</div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              {isCancel ? `Was scheduled for: ${item.time}` : `Moved to: ${item.time}`}
            </div>
            {item.note && (
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
                "{item.note}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default NotificationAlert;
