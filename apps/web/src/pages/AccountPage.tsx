import { FormEvent, useEffect, useState } from "react";
import { ToastBanner, useToast } from "../../../../packages/shared/src/ui/toast";
import { useAuth } from "../context/AuthContext";
import {
  createAddress,
  getAddresses,
  getProfile,
  updateAddress,
  updateProfile,
  type Address
} from "../lib/api";

const emptyAddress = {
  line1: "",
  line2: "",
  landmark: "",
  area: "",
  city: "",
  pincode: "",
  isDefault: false
};

export function AccountPage() {
  const { token, customer } = useAuth();
  const { toast, showToast, dismissToast } = useToast();
  const [name, setName] = useState(customer?.name || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [mobile, setMobile] = useState(customer?.mobile || "");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAccountData() {
    if (!token) return;
    setLoading(true);
    dismissToast();
    try {
      const [profile, addressList] = await Promise.all([getProfile(token), getAddresses(token)]);
      setName(profile.name || "");
      setEmail(profile.email || "");
      setMobile(profile.mobile || "");
      setAddresses(addressList);
    } catch {
      showToast("error", "Unable to load account details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccountData();
  }, [token]);

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault();
    if (!token || !name.trim()) {
      showToast("error", "Name is required");
      return;
    }

    try {
      await updateProfile(token, { name: name.trim(), email: email.trim() || undefined });
      showToast("success", "Profile updated");
    } catch {
      showToast("error", "Unable to update profile");
    }
  }

  function startEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddressForm({
      line1: address.line1,
      line2: address.line2 || "",
      landmark: address.landmark || "",
      area: address.area,
      city: address.city,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
  }

  function resetAddressForm() {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
  }

  async function onSaveAddress(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    if (!addressForm.line1.trim() || !addressForm.area.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      showToast("error", "Line 1, area, city and pincode are required");
      return;
    }

    try {
      if (editingAddressId) {
        await updateAddress(token, editingAddressId, {
          ...addressForm,
          line1: addressForm.line1.trim(),
          line2: addressForm.line2.trim() || undefined,
          landmark: addressForm.landmark.trim() || undefined,
          area: addressForm.area.trim(),
          city: addressForm.city.trim(),
          pincode: addressForm.pincode.trim()
        });
        showToast("success", "Address updated");
      } else {
        await createAddress(token, {
          ...addressForm,
          line1: addressForm.line1.trim(),
          line2: addressForm.line2.trim() || undefined,
          landmark: addressForm.landmark.trim() || undefined,
          area: addressForm.area.trim(),
          city: addressForm.city.trim(),
          pincode: addressForm.pincode.trim()
        });
        showToast("success", "Address added");
      }
      resetAddressForm();
      await loadAccountData();
    } catch {
      showToast("error", "Unable to save address");
    }
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Account</h2>
        <small>{mobile}</small>
      </div>

      <ToastBanner toast={toast} onDismiss={dismissToast} />

      {loading ? <p>Loading account...</p> : null}

      <article className="card">
        <h3>Profile</h3>
        <form className="form-stack" onSubmit={onSaveProfile}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
          <input value={mobile} disabled placeholder="Mobile number" />
          <button type="submit">Save Profile</button>
        </form>
      </article>

      <article className="card">
        <div className="section-head">
          <h3>Addresses</h3>
          <small>{addresses.length} saved</small>
        </div>

        <form className="form-stack" onSubmit={onSaveAddress}>
          <input
            value={addressForm.line1}
            onChange={(event) => setAddressForm((current) => ({ ...current, line1: event.target.value }))}
            placeholder="House / street"
          />
          <input
            value={addressForm.line2}
            onChange={(event) => setAddressForm((current) => ({ ...current, line2: event.target.value }))}
            placeholder="Apartment / locality"
          />
          <input
            value={addressForm.landmark}
            onChange={(event) => setAddressForm((current) => ({ ...current, landmark: event.target.value }))}
            placeholder="Landmark"
          />
          <div className="grid two">
            <input
              value={addressForm.area}
              onChange={(event) => setAddressForm((current) => ({ ...current, area: event.target.value }))}
              placeholder="Area"
            />
            <input
              value={addressForm.city}
              onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
              placeholder="City"
            />
          </div>
          <div className="grid two">
            <input
              value={addressForm.pincode}
              onChange={(event) => setAddressForm((current) => ({ ...current, pincode: event.target.value }))}
              placeholder="Pincode"
            />
            <label className="toggle-line">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))}
              />
              Make default
            </label>
          </div>
          <div className="inline-actions">
            <button type="submit">{editingAddressId ? "Update Address" : "Add Address"}</button>
            {editingAddressId ? (
              <button type="button" className="button-subtle" onClick={resetAddressForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        <div className="address-list">
          {addresses.map((address) => (
            <article className="address-card" key={address.id}>
              <div className="section-head">
                <strong>{address.area}</strong>
                {address.isDefault ? <span className="chip chip-live">Default</span> : null}
              </div>
              <p>{address.line1}</p>
              {address.line2 ? <p>{address.line2}</p> : null}
              {address.landmark ? <p>{address.landmark}</p> : null}
              <p>
                {address.city} - {address.pincode}
              </p>
              <button type="button" className="button-subtle" onClick={() => startEditAddress(address)}>
                Edit Address
              </button>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
