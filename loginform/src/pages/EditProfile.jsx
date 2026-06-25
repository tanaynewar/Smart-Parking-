import  { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import '../css/EditProfile.css'

const EditProfile = () => {
    const { backendUrl, getUserData } = useContext(AppContext)
    const navigate = useNavigate()

    const [form, setForm] = useState({ username: '', email: '', phone: '', car_number: '', vehicle_type: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
    const fetchProfile = async () => {
        try {
            axios.defaults.withCredentials = true
            const { data } = await axios.get(`${backendUrl}/api/auth/profile`)
            if (data.success) {
                const u = data.user
                console.log(u);
                setForm({
                    username: u.username || '',
                    email: u.email || '',
                    phone: u.phoneNumber || '',
                    car_number: u.car_number || '',
                    vehicle_type: u.vehicle_type ? String(u.vehicle_type) : ''
                })
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to load profile.' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load profile.' })
        } finally {
            setLoading(false)
        }
    }
    fetchProfile()
}, [backendUrl])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username || !form.email || !form.phone || !form.car_number || !form.vehicle_type) {
            return setMessage({ type: 'error', text: 'All fields are required.' })
        }
        setSaving(true)
        setMessage({ type: '', text: '' })
        try {
            axios.defaults.withCredentials = true
            const { data } = await axios.put(`${backendUrl}/api/auth/profile`, form)
            if (data.success) {
                await getUserData()
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
            } else {
                setMessage({ type: 'error', text: data.message })
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || err.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="ep-root">
                <div className="ep-nav">
                    <div className="ep-logo">No Parking Pickup</div>
                </div>
                <div className="ep-center">
                    <p className="ep-loading">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="ep-root">
            <div className="ep-nav">
                <div className="ep-logo">No Parking Pickup</div>
                <div className="ep-nav-right">
                    <button className="ep-back-btn" onClick={() => navigate('/')}>Back to Home</button>
                </div>
            </div>

            <div className="ep-wrap">

                {/* LEFT — info panel */}
                <div className="ep-brand">
                    <div className="ep-brand-tag">Account Settings</div>
                    <h1 className="ep-brand-title">Edit Your<br />Profile</h1>
                    <p className="ep-brand-desc">
                        Keep your details up to date so we can reach you and link violations to the right vehicle.
                    </p>
                    <div className="ep-steps">
                        <div className="ep-step">
                            <span className="ep-step-num">01</span>
                            <span>Update your name and contact</span>
                        </div>
                        <div className="ep-step">
                            <span className="ep-step-num">02</span>
                            <span>Verify your vehicle number</span>
                        </div>
                        <div className="ep-step">
                            <span className="ep-step-num">03</span>
                            <span>Save and you're done</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT — form */}
                <div className="ep-form-wrap">
                    <div className="ep-card">
                        <p className="ep-eyebrow">My Account</p>
                        <h2 className="ep-title">Edit Profile</h2>
                        <p className="ep-sub">Changes apply immediately after saving</p>

                        {message.text && (
                            <div className={message.type === 'success' ? 'ep-alert-success' : 'ep-alert-error'}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="ep-form">
                            <div className="ep-field">
                                <label className="ep-label">Full Name</label>
                                <input
                                    className="ep-input"
                                    type="text"
                                    name="username"
                                    placeholder="Enter full name"
                                    value={form.username}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="ep-field">
                                <label className="ep-label">Email</label>
                                <input
                                    className="ep-input"
                                    type="text"
                                    name="email"
                                    placeholder="Enter email"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="ep-field">
                                <label className="ep-label">Phone No.</label>
                                <input
                                    className="ep-input"
                                    type="tel"
                                    name="phone"
                                    placeholder="10-digit phone number"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="ep-field">
                                <label className="ep-label">Vehicle Number</label>
                                <input
                                    className="ep-input"
                                    type="text"
                                    name="car_number"
                                    placeholder="e.g. RJ14CD1234"
                                    value={form.car_number}
                                    onChange={handleChange}
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>

                            <div className="ep-field">
                                <label className="ep-label">Vehicle Type</label>
                                <select
                                    className="ep-input"
                                    name="vehicle_type"
                                    value={form.vehicle_type}
                                    onChange={handleChange}
                                >
                                    <option value="">Select vehicle type</option>
                                    <option value="2">2 Wheeler</option>
                                    <option value="3">3 Wheeler</option>
                                    <option value="4">4 Wheeler</option>
                                </select>
                            </div>

                            <button className="ep-submit" type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>

                        <div className="ep-footer-link">
                            <p onClick={() => navigate('/')}>← Back to Home</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditProfile