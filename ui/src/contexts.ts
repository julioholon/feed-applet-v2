import { SensemakerStore } from '@neighbourhoods/nh-launcher-applet';
import { createContext } from '@lit-labs/context';
import { FeedStore } from './feed-store';

export const feedStoreContext = createContext<FeedStore>(
    'feed-store-context'
);
export const sensemakerStoreContext = createContext<SensemakerStore>(
    'sensemaker-store-context'
);