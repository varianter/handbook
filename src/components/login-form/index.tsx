import { signIn, signOut, useUserdata } from 'src/auth';
import Button from '../button';

import style from './login.module.css';

export default function LoginForm({}: {}) {
  const user = useUserdata();

  return (
    <div className={style.container}>
      {user ? (
        <>
          <div className={style.text}>
            {user.name} ({user.department})
          </div>
          <Button onClick={() => signOut()}>Logg ut</Button>
        </>
      ) : (
        <Button onClick={() => signIn('azure-ad')}>Logg inn</Button>
      )}
    </div>
  );
}
