'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Mission {
  id: number;
  code: string;
  name: string;
  city: string;
  country_code: string;
  country_name: string;
  region: string;
  mission_type: string;
  is_active: boolean;
  total_officers: number;
  total_applications: number;
  pending_applications: number;
}

interface Officer {
  id: number;
  name: string;
  email: string;
  role: string;
  can_review: boolean;
  can_approve: boolean;
}

interface CountryMapping {
  id: number;
  country_code: string;
  country_name: string;
  is_primary: boolean;
}

export default function MissionManagementPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<Officer[]>([]);
  const [countryMappings, setCountryMappings] = useState<CountryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'officers' | 'countries'>('overview');
  const [showAddMissionModal, setShowAddMissionModal] = useState(false);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/admin/missions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setMissions(data.missions);
    } catch (error) {
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMissionDetails = async (missionId: number) => {
    try {
      const [detailsRes, officersRes, countriesRes] = await Promise.all([
        fetch(`/api/admin/missions/${missionId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`/api/admin/missions/${missionId}/officers`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`/api/admin/missions/${missionId}/countries`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      const details = await detailsRes.json();
      const officersData = await officersRes.json();
      const countriesData = await countriesRes.json();

      setSelectedMission(details.mission);
      setOfficers(officersData.officers);
      setCountryMappings(countriesData.mappings);
    } catch (error) {
      toast.error('Failed to load mission details');
    }
  };

  const fetchAvailableOfficers = async () => {
    try {
      const response = await fetch('/api/admin/missions/available-officers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setAvailableOfficers(data.officers);
    } catch (error) {
      toast.error('Failed to load available officers');
    }
  };

  const handleSelectMission = (mission: Mission) => {
    setSelectedMission(mission);
    fetchMissionDetails(mission.id);
    setActiveTab('overview');
  };

  const handleAssignOfficer = async (officerId: number) => {
    if (!selectedMission) return;

    try {
      const response = await fetch(`/api/admin/missions/${selectedMission.id}/officers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: officerId }),
      });

      if (response.ok) {
        toast.success('Officer assigned successfully');
        fetchMissionDetails(selectedMission.id);
        setShowAddOfficerModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to assign officer');
      }
    } catch (error) {
      toast.error('Failed to assign officer');
    }
  };

  const handleRemoveOfficer = async (officerId: number) => {
    if (!selectedMission) return;
    if (!confirm('Are you sure you want to remove this officer from the mission?')) return;

    try {
      const response = await fetch(`/api/admin/missions/${selectedMission.id}/officers/${officerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        toast.success('Officer removed successfully');
        fetchMissionDetails(selectedMission.id);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to remove officer');
      }
    } catch (error) {
      toast.error('Failed to remove officer');
    }
  };

  const handleAddCountryMapping = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMission) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      country_code: formData.get('country_code'),
      country_name: formData.get('country_name'),
      is_primary: formData.get('is_primary') === 'on',
    };

    try {
      const response = await fetch(`/api/admin/missions/${selectedMission.id}/countries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Country mapping added successfully');
        fetchMissionDetails(selectedMission.id);
        setShowAddCountryModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add country mapping');
      }
    } catch (error) {
      toast.error('Failed to add country mapping');
    }
  };

  const handleRemoveCountryMapping = async (mappingId: number) => {
    if (!selectedMission) return;
    if (!confirm('Are you sure you want to remove this country mapping?')) return;

    try {
      const response = await fetch(`/api/admin/missions/${selectedMission.id}/countries/${mappingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        toast.success('Country mapping removed successfully');
        fetchMissionDetails(selectedMission.id);
      } else {
        toast.error('Failed to remove country mapping');
      }
    } catch (error) {
      toast.error('Failed to remove country mapping');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mission Management</h1>
          <p className="text-gray-600 mt-2">Manage MFA missions, officers, and country assignments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Missions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Missions</h2>
                <button
                  onClick={() => setShowAddMissionModal(true)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Add Mission
                </button>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {missions.map((mission) => (
                  <button
                    key={mission.id}
                    onClick={() => handleSelectMission(mission)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      selectedMission?.id === mission.id ? 'bg-green-50 border-l-4 border-green-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{mission.name}</h3>
                        <p className="text-sm text-gray-600">{mission.city}, {mission.country_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{mission.code}</p>
                      </div>
                      {!mission.is_active && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Inactive</span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-gray-600">
                      <span>{mission.total_officers} officers</span>
                      <span>{mission.pending_applications} pending</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mission Details */}
          <div className="lg:col-span-2">
            {selectedMission ? (
              <div className="bg-white rounded-lg shadow">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-3 text-sm font-medium ${
                        activeTab === 'overview'
                          ? 'border-b-2 border-green-600 text-green-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('officers')}
                      className={`px-6 py-3 text-sm font-medium ${
                        activeTab === 'officers'
                          ? 'border-b-2 border-green-600 text-green-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Officers ({officers.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('countries')}
                      className={`px-6 py-3 text-sm font-medium ${
                        activeTab === 'countries'
                          ? 'border-b-2 border-green-600 text-green-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Countries ({countryMappings.length})
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedMission.name}</h2>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-600">Code</p>
                          <p className="font-mono text-gray-900">{selectedMission.code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="text-gray-900 capitalize">{selectedMission.mission_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="text-gray-900">{selectedMission.city}, {selectedMission.country_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Region</p>
                          <p className="text-gray-900">{selectedMission.region || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-600">Total Officers</p>
                          <p className="text-2xl font-bold text-blue-900">{selectedMission.total_officers}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-sm text-yellow-600">Pending Applications</p>
                          <p className="text-2xl font-bold text-yellow-900">{selectedMission.pending_applications}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600">Total Applications</p>
                          <p className="text-2xl font-bold text-green-900">{selectedMission.total_applications}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'officers' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Assigned Officers</h3>
                        <button
                          onClick={() => {
                            fetchAvailableOfficers();
                            setShowAddOfficerModal(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Assign Officer
                        </button>
                      </div>
                      <div className="space-y-3">
                        {officers.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No officers assigned to this mission</p>
                        ) : (
                          officers.map((officer) => (
                            <div key={officer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div>
                                <p className="font-semibold text-gray-900">{officer.name}</p>
                                <p className="text-sm text-gray-600">{officer.email}</p>
                                <div className="flex gap-2 mt-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {officer.role.replace('_', ' ').toUpperCase()}
                                  </span>
                                  {officer.can_review && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Can Review</span>
                                  )}
                                  {officer.can_approve && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Can Approve</span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveOfficer(officer.id)}
                                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'countries' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Country Mappings</h3>
                        <button
                          onClick={() => setShowAddCountryModal(true)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Add Country
                        </button>
                      </div>
                      <div className="space-y-2">
                        {countryMappings.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No country mappings configured</p>
                        ) : (
                          countryMappings.map((mapping) => (
                            <div key={mapping.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-lg">{mapping.country_code}</span>
                                <span className="text-gray-900">{mapping.country_name}</span>
                                {mapping.is_primary && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Primary</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveCountryMapping(mapping.id)}
                                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">Select a mission to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Officer Modal */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Officer to Mission</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableOfficers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No available officers</p>
              ) : (
                availableOfficers.map((officer) => (
                  <button
                    key={officer.id}
                    onClick={() => handleAssignOfficer(officer.id)}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <p className="font-semibold text-gray-900">{officer.name}</p>
                    <p className="text-sm text-gray-600">{officer.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{officer.role.replace('_', ' ').toUpperCase()}</p>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowAddOfficerModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Country Modal */}
      {showAddCountryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Country Mapping</h3>
            <form onSubmit={handleAddCountryMapping}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
                  <input
                    type="text"
                    name="country_code"
                    maxLength={2}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 uppercase"
                    placeholder="US"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country Name</label>
                  <input
                    type="text"
                    name="country_name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    placeholder="United States"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_primary"
                    id="is_primary"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
                    Primary country for this mission
                  </label>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Country
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCountryModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
