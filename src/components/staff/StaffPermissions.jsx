import React, { useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { useApp } from '../../context/AppContext';
import { getStaffAccountUid } from '../../services/staffSignup';
import { sanitizeText } from '../../domain/sanitize';

export default function StaffPermissions() {
  const { showToast } = useApp();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingUid, setDeletingUid] = useState(null);
  const creating = useRef(false);

  useEffect(() => onSnapshot(collection(firestore, 'operators'), snapshot => {
    setOperators(snapshot.docs.map(item => ({ ...item.data(), uid: item.id })));
    setLoading(false);
  }, () => { setLoadError(true); setLoading(false); }), []);

  async function addStaff(event) {
    event.preventDefault();
    if (creating.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = sanitizeText(data.get('name'), 80);
    const email = sanitizeText(data.get('email'), 120);
    const password = data.get('password') || '';
    if (!name || !email || password.length < 8) {
      showToast('Enter a name, email, and password of at least 8 characters.', 'error');
      return;
    }
    creating.current = true;
    setSaving(true);
    try {
      const uid = await getStaffAccountUid(email, password);
      await runTransaction(firestore, async transaction => {
        const ref = doc(firestore, 'operators', uid);
        if ((await transaction.get(ref)).exists()) throw new Error('This account already has an operator profile.');
        transaction.set(ref, { name, email, role: 'staff', active: true });
      });
      form.reset();
      showToast('Staff account created.');
    } catch (error) {
      const detail = {
        'auth/weak-password': 'Choose a stronger password.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/network-request-failed': 'Could not connect. Retry with the same email and password.',
        'permission-denied': 'Could not grant staff access. Check your owner access and retry with the same credentials.'
      }[error.code];
      showToast(detail || error.message || 'Could not create the staff account.', 'error');
    } finally {
      creating.current = false;
      setSaving(false);
    }
  }

  async function toggleAccess(operator) {
    try {
      const ref = doc(firestore, 'operators', operator.uid);
      await runTransaction(firestore, async transaction => {
        const current = await transaction.get(ref);
        if (!current.exists() || current.data().role !== 'staff') throw new Error('Staff account unavailable.');
        transaction.update(ref, { active: !operator.active });
      });
      showToast(operator.active ? 'POS access disabled.' : 'POS access restored.');
    } catch (error) {
      showToast(error.message || 'Could not change access.', 'error');
    }
  }

  async function deleteStaff(operator) {
    if (deletingUid || operator.role !== 'staff' || operator.active !== false) return;
    if (!window.confirm(`Remove ${operator.name || operator.email || 'this staff member'} from Staff access? Their past sales and expenses will stay in the records.`)) return;

    setDeletingUid(operator.uid);
    try {
      const ref = doc(firestore, 'operators', operator.uid);
      await runTransaction(firestore, async transaction => {
        const current = (await transaction.get(ref)).data();
        if (current?.role !== 'staff' || current.active !== false) {
          throw new Error('Only disabled staff can be deleted.');
        }
        transaction.delete(ref);
      });
      showToast('Staff profile deleted.');
    } catch (error) {
      showToast(error.message || 'Could not delete the staff profile.', 'error');
    } finally {
      setDeletingUid(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 app-gutters py-4 sm:py-6">
      <div>
        <h1 className="text-xl font-bold">Staff access</h1>
        <p className="mt-1 text-sm text-slate-300">Staff can bill, manage table orders, view order history, and record expenses.</p>
      </div>
      <form onSubmit={addStaff} className="space-y-4 rounded-xl border border-slate-700 bg-[#171c26] p-4">
        <h2 className="font-bold">Add staff account</h2>
        <p className="text-sm text-slate-300">Staff can sign in with the email and password you set here.</p>
        <label className="block text-sm">Name
          <input name="name" maxLength={100} required className="mt-1 w-full rounded-lg border border-slate-600 bg-[#121620] p-2" />
        </label>
        <label className="block text-sm">Staff email
          <input name="email" type="email" maxLength={120} autoComplete="off" required
            className="mt-1 w-full rounded-lg border border-slate-600 bg-[#121620] p-2" />
        </label>
        <label className="block text-sm">Staff password
          <input name="password" type="password" autoComplete="new-password" minLength={8} required
            className="mt-1 w-full rounded-lg border border-slate-600 bg-[#121620] p-2" />
        </label>
        <button type="submit" disabled={saving} className="rounded-lg bg-orange-700 px-3 py-2 text-sm font-bold disabled:opacity-60">
          {saving ? 'Creating…' : 'Create staff account'}
        </button>
      </form>
      <section className="space-y-2" aria-label="Operators">
        {loading && <p role="status">Loading operators…</p>}
        {loadError && <p role="alert">Could not load operators. Check your connection and reload this screen.</p>}
        {operators.map(operator => (
          <div key={operator.uid} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 p-3">
            <div>
              <div className="font-semibold">{operator.name || 'Operator'}</div>
              {operator.email && <div className="text-sm text-slate-300">{operator.email}</div>}
              <div className="text-sm text-slate-300">{operator.role === 'owner' ? 'Owner' : 'Staff'} · {operator.active ? 'Active' : 'Disabled'}</div>
            </div>
            {operator.role === 'staff' && (
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={deletingUid === operator.uid}
                  className="rounded-lg border border-slate-600 px-3 py-2 text-sm"
                  onClick={() => toggleAccess(operator)}>
                  {operator.active ? 'Disable access' : 'Restore access'}
                </button>
                {operator.active === false && (
                  <button type="button" disabled={deletingUid !== null}
                    className="rounded-lg border border-rose-700 px-3 py-2 text-sm text-rose-200 hover:bg-rose-950 disabled:opacity-60"
                    onClick={() => deleteStaff(operator)}>
                    {deletingUid === operator.uid ? 'Deleting…' : 'Delete staff'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
