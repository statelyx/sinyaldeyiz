import { createSupabase } from '@/lib/supabase/client'

/**
 * Status/Story Service
 * Handles temporary status messages that expire after 1 hour
 */

export interface StatusData {
    message: string
    expiresAt: string
}

/**
 * Set user's status message
 * @param message - Status message (max 100 characters)
 * @param durationMinutes - Duration in minutes (default: 60 minutes = 1 hour)
 */
export async function setStatus(
    message: string,
    durationMinutes: number = 60
): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate message
        if (!message || message.trim().length === 0) {
            return { success: false, error: 'Mesaj boş olamaz' }
        }

        if (message.length > 100) {
            return { success: false, error: 'Mesaj maksimum 100 karakter olabilir' }
        }

        const supabase = createSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Kullanıcı oturumu bulunamadı' }
        }

        const now = new Date()
        const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000)

        const { error } = await (supabase
            .from('location_status') as any)
            .update({
                status_message: message.trim(),
                status_expires_at: expiresAt.toISOString(),
                updated_at: now.toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            console.error('Error setting status:', error)
            return { success: false, error: 'Durum mesajı kaydedilemedi: ' + error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error in setStatus:', error)
        return { success: false, error: 'Beklenmeyen bir hata oluştu' }
    }
}

/**
 * Clear user's status message
 */
export async function clearStatus(): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Kullanıcı oturumu bulunamadı' }
        }

        const { error } = await (supabase
            .from('location_status') as any)
            .update({
                status_message: null,
                status_expires_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (error) {
            console.error('Error clearing status:', error)
            return { success: false, error: 'Durum mesajı silinemedi' }
        }

        return { success: true }
    } catch (error) {
        console.error('Error in clearStatus:', error)
        return { success: false, error: 'Beklenmeyen bir hata oluştu' }
    }
}

/**
 * Get user's current status
 */
export async function getStatus(): Promise<{ success: boolean; status?: StatusData; error?: string }> {
    try {
        const supabase = createSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Kullanıcı oturumu bulunamadı' }
        }

        const { data, error } = await (supabase
            .from('location_status') as any)
            .select('status_message, status_expires_at')
            .eq('user_id', user.id)
            .single()

        if (error) {
            return { success: false, error: 'Durum mesajı alınamadı' }
        }

        // Check if status has expired
        if (data.status_expires_at) {
            const expiresAt = new Date(data.status_expires_at)
            if (expiresAt <= new Date()) {
                // Auto-clear expired status
                await clearStatus()
                return { success: true }
            }
        }

        return {
            success: true,
            status: data.status_message ? {
                message: data.status_message,
                expiresAt: data.status_expires_at,
            } : undefined,
        }
    } catch (error) {
        console.error('Error in getStatus:', error)
        return { success: false, error: 'Beklenmeyen bir hata oluştu' }
    }
}
