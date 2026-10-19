import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface StudentProfile {
  id: string;
  username: string;
  full_name: string;
  must_change_password: boolean;
}

export const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [generatedPass, setGeneratedPass] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, must_change_password')
      .eq('role', 'student');
    if (data) setStudents(data);
  };

  const handleResetPassword = async (studentId: string) => {
    const tempPassword = `Temp_${Math.random().toString(36).slice(-8)}!`;

    // Call Supabase Edge Function or an Admin API endpoint using service role key
    const response = await fetch('/api/admin-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: studentId, newPassword: tempPassword }),
    });

    if (response.ok) {
      await supabase
        .from('profiles')
        .update({ must_change_password: true })
        .eq('id', studentId);

      setGeneratedPass((prev) => ({ ...prev, [studentId]: tempPassword }));
      fetchStudents();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#1e1b2e]">Instructor Administration Panel</h1>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 text-sm font-semibold text-gray-600">Student Name</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Username</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Temporary Password</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b last:border-none">
                <td className="p-4 text-sm">{student.full_name || 'No Name'}</td>
                <td className="p-4 text-sm font-mono text-gray-500">{student.username}</td>
                <td className="p-4 text-sm">
                  {generatedPass[student.id] ? (
                    <span className="font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {generatedPass[student.id]}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Not generated</span>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleResetPassword(student.id)}
                    className="text-xs bg-[#7c3aed] text-white px-3 py-1.5 rounded hover:bg-[#6d28d9]"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};