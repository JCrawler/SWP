import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface Props {
  userId: string;
  onPasswordChanged: () => void;
}

export const ForceChangePassword: React.FC<Props> = ({ userId, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const { error: updateAuthError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateAuthError) {
      setError(updateAuthError.message);
      return;
    }

    await supabase.from('profiles').update({ must_change_password: false }).eq('id', userId);
    onPasswordChanged();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f2fb] px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md border border-[#e3e0f5]">
        <h2 className="text-xl font-bold text-[#1e1b2e] mb-2">Change Temporary Password</h2>
        <p className="text-sm text-gray-500 mb-4">Please set a new, permanent password to continue.</p>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full py-2 bg-[#7c3aed] text-white rounded font-medium">
            Update Password & Access Portfolio
          </button>
        </form>
      </div>
    </div>
  );
};