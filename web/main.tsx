import {createRoot} from 'react-dom/client';
import Editor from '../app/editor';
import '../app/globals.css';
import '../app/studio.css';
import '../app/premium.css';
import './fonts.css';
createRoot(document.getElementById('root')!).render(<Editor/>);
