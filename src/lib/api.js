import { supabase } from './supabase'

export const api = {
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data.user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  },

  async fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Fetch profiles error:', error)
      throw error
    }
  },

  async createProfile(profileData) {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([profileData])
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Create profile error:', error)
      throw error
    }
  },

  async deleteProfile(id) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Delete profile error:', error)
      throw error
    }
  },

  async updateProfile(id, profileData) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  },

  async fetchActivities() {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Fetch activities error:', error)
      throw error
    }
  },

  async createActivity(activityData) {
    try {
      const { error } = await supabase
        .from('activities')
        .insert([activityData])
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Create activity error:', error)
      throw error
    }
  },

  async fetchRegistrations(userId) {
    try {
      if (!userId) return []
      const { data, error } = await supabase
        .from('registrations')
        .select('activity_id')
        .eq('user_id', userId)
      if (error) throw error
      return data?.map(r => r.activity_id) || []
    } catch (error) {
      console.error('Fetch registrations error:', error)
      return []
    }
  },

  async createRegistration(registrationData) {
    try {
      const { error } = await supabase
        .from('registrations')
        .insert([registrationData])
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Create registration error:', error)
      throw error
    }
  },

  async fetchStats() {
    try {
      const [activitiesData, registrationsData] = await Promise.all([
        supabase
          .from('activities')
          .select('*')
          .order('date', { ascending: false }),
        supabase
          .from('registrations')
          .select('*, profiles:user_id(name, student_id, major), activities:activity_id(title)')
          .order('created_at', { ascending: false }),
      ])

      if (activitiesData.error) throw activitiesData.error
      if (registrationsData.error) throw registrationsData.error

      return {
        activities: activitiesData.data || [],
        registrations: registrationsData.data || [],
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
      throw error
    }
  },

  async fetchDashboardStats() {
    try {
      const [membersCount, activitiesCount, registrationsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
      ])

      return {
        members: membersCount.count || 0,
        activities: activitiesCount.count || 0,
        registrations: registrationsCount.count || 0,
      }
    } catch (error) {
      console.error('Fetch dashboard stats error:', error)
      throw error
    }
  },

  async uploadImage(file, bucket, path) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Upload image error:', error)
      throw error
    }
  },

  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  }
}
