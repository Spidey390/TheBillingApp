import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../services/firebase';
import { AppProvider } from '../../context/AppContext';
import App from '../../App';
import { AccountMessage } from './OperatorGate';

export default function OperatorWorkspace({ user, onSignOut }) {
  const [operator, setOperator] = useState(undefined);
  const [error, setError] = useState('');

  useEffect(() => onSnapshot(doc(firestore, 'operators', user.uid), snapshot => {
    setOperator(snapshot.data() || null);
  }, () => {
    setOperator(null);
    setError('The operator profile could not be loaded. Check your connection and sign in again.');
  }), [user.uid]);

  if (operator?.active && ['owner', 'staff'].includes(operator.role)) {
    return (
      <AppProvider key={operator.role} operator={{ ...operator, uid: user.uid, email: user.email }} signOut={onSignOut}>
        <App />
      </AppProvider>
    );
  }

  return (
    <AccountMessage>
      {operator === undefined ? <p role="status" className="mt-4">Checking operator access…</p> : (
        <>
          <p role="alert" className="mt-4 text-sm">{error || 'This account has no active POS access. Contact the owner.'}</p>
          <button type="button" className="mt-4 underline" onClick={onSignOut}>Sign out</button>
        </>
      )}
    </AccountMessage>
  );
}
