'use client';

interface AlertBoxProps {
  type: 'error' | 'success';
  message: string;
}

export default function AlertBox({ type, message }: AlertBoxProps) {
  if (!message) return null;
  const styles =
    type === 'error'
      ? 'bg-red-50 border border-red-200 text-red-700'
      : 'bg-green-50 border border-green-200 text-green-700';

  return (
    <div
      className={`${styles} text-sm rounded-lg px-4 py-3 mb-4`}
      dangerouslySetInnerHTML={{ __html: message }}
    />
  );
}
