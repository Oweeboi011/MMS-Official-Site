import { useEffect, useState, type ChangeEvent } from 'react';
import { myPhotoUrl, removePhoto, savePhoto } from '../services/profilePhoto';

// Only you and admins can see the photo. It saves at once, apart from the details form.
export default function ProfilePhoto({ uid }: { uid: string }) {
  const [url, setUrl] = useState('');
  const [state, setState] = useState({ busy: false, message: '' });
  useEffect(() => {
    myPhotoUrl(uid).then(setUrl, () => setUrl(''));
  }, [uid]);

  const run = async (task: () => Promise<string>) => {
    setState({ busy: true, message: '' });
    try {
      setUrl(await task());
      setState({ busy: false, message: '' });
    } catch (err) {
      setState({ busy: false, message: `Not saved: ${(err as Error).message}` });
    }
  };
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setState({ busy: false, message: 'Choose an image file.' });
    void run(() => savePhoto(uid, file));
  };

  return (
    <div className="profile-photo">
      {url ? <img src={url} alt="Your profile" width="96" height="96" /> : <span className="profile-photo-empty" aria-hidden="true">No photo</span>}
      <div>
        <label htmlFor="d-photo">{url ? 'Change photo' : 'Add photo'}</label>
        <input id="d-photo" type="file" accept="image/*" disabled={state.busy} onChange={pick} />
        {url && <button type="button" className="link-button" disabled={state.busy} onClick={() => void run(async () => { await removePhoto(uid); return ''; })}>Remove</button>}
        <p className="climb-muted">Only you and the officers can see your photo.</p>
        {state.message && <p role="alert" className="field-error">{state.message}</p>}
      </div>
    </div>
  );
}
