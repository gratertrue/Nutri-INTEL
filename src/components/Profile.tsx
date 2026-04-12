/* ############################################################
   # COMPONENT: PROFILE
   # This component handles user settings and calorie goals.
   ############################################################ */

import React from 'react';
import { showSuccess } from '@/utils/toast';

interface ProfileProps {
  profile: any;
  setProfile: (p: any) => void;
}

const Profile = ({ profile, setProfile }: ProfileProps) => {
  return (
    <div className="space-y-4">
      <div className="glass-card">
        <h3 className="font-bold mb-4">Edit Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 uppercase font-bold">Name</label>
            <input 
              className="input-field mt-1" 
              value={profile.name} 
              onChange={e => setProfile({...profile, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase font-bold">Daily Calorie Goal</label>
            <input 
              type="number" 
              className="input-field mt-1" 
              value={profile.calorieGoal} 
              onChange={e => setProfile({...profile, calorieGoal: Number(e.target.value)})} 
            />
          </div>
          <button onClick={() => showSuccess("Profile Saved!")} className="btn-primary mt-4">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;