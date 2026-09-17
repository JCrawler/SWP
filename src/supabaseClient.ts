import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile, Portfolio } from './types';
import { nicknameToEmail } from './lib/nicknameAuth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isRealSupabase = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'your-anon-key'
);

// Demo seed data
export const DEMO_PASSWORD = 'student123';

export const INITIAL_DEMO_PROFILES: Profile[] = [
  {
    id: 'demo-user-ana-uuid-001',
    nickname: 'demo_ana',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'demo-user-leo-uuid-002',
    nickname: 'demo_leo',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'demo-user-mika-uuid-003',
    nickname: 'demo_mika',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

export const INITIAL_DEMO_PORTFOLIOS: Portfolio[] = [
  {
    id: 'demo-portfolio-ana-001',
    owner_id: 'demo-user-ana-uuid-001',
    title: "Ana's Minimalist Design Studio",
    html_code: `<main class="container">
  <header class="header">
    <div class="avatar">A</div>
    <h1>Ana Silva</h1>
    <p class="tagline">Visual & Interaction Designer based in Lisbon</p>
  </header>
  <section class="grid">
    <article class="card">
      <div class="badge">Branding</div>
      <h3>Studio Sol</h3>
      <p>Identity and packaging for an organic botanical studio.</p>
    </article>
    <article class="card">
      <div class="badge">Mobile App</div>
      <h3>Chrono Flow</h3>
      <p>A calm time-tracker focusing on circadian rhythms.</p>
    </article>
    <article class="card">
      <div class="badge">Typography</div>
      <h3>Type Specimen</h3>
      <p>Exploratory editorial specimen for geometric sans.</p>
    </article>
  </section>
  <footer class="footer">
    <p>Available for select freelance projects &bull; 2026</p>
  </footer>
</main>`,
    css_code: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #fdfbf7;
  color: #2c2523;
  padding: 32px 20px;
  display: flex;
  justify-content: center;
}
.container { max-width: 680px; width: 100%; }
.header { text-align: center; margin-bottom: 40px; }
.avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: #e87a5d; color: white; display: inline-flex;
  align-items: center; justify-content: center; font-size: 24px;
  font-weight: 700; margin-bottom: 16px;
}
h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
.tagline { color: #7a6e69; margin-top: 8px; font-size: 15px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; }
.card {
  background: white; border: 1px solid #ebdcd5; border-radius: 12px;
  padding: 20px; transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(44,37,35,0.06); }
.badge {
  display: inline-block; font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.8px; font-weight: 700; color: #e87a5d; margin-bottom: 8px;
}
.card h3 { font-size: 16px; margin-bottom: 6px; }
.card p { font-size: 13px; color: #665b56; line-height: 1.5; }
.footer { text-align: center; margin-top: 48px; font-size: 12px; color: #9c8e88; }`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'demo-portfolio-leo-002',
    owner_id: 'demo-user-leo-uuid-002',
    title: "Leo's Pixel & Retro Game Lab",
    html_code: `<div class="arcade-cabinet">
  <div class="marquee">
    <span class="pixel-star">&#9733;</span> LEO'S GAME ART LAB <span class="pixel-star">&#9733;</span>
  </div>
  <p class="subtitle">Indie Game Developer &amp; 16-Bit Pixel Artist</p>
  
  <div class="slots">
    <div class="slot">
      <div class="slot-header">QUEST-01</div>
      <h4>Neon Dungeon Crawler</h4>
      <p>Top-down rogue-like with custom lighting engine and 8-bit chiptunes.</p>
    </div>
    <div class="slot">
      <div class="slot-header">QUEST-02</div>
      <h4>Solar Glider 3000</h4>
      <p>Atmospheric endless runner through futuristic sand dunes.</p>
    </div>
    <div class="slot">
      <div class="slot-header">SPRITES</div>
      <h4>Cyber Samurais Pack</h4>
      <p>Animated 32x32 sprite sheets with 12 distinct attack frames.</p>
    </div>
  </div>
  
  <div class="status-bar">
    <span>LIVES: &infin;</span>
    <span>SCORE: 994,210</span>
    <span>STATUS: READY</span>
  </div>
</div>`,
    css_code: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #0f1019;
  color: #d1d5db;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
}
.arcade-cabinet {
  max-width: 640px;
  width: 100%;
  background: #191b2b;
  border: 3px solid #6366f1;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.25);
}
.marquee {
  background: #6366f1;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  text-align: center;
  padding: 10px;
  letter-spacing: 2px;
  border-radius: 4px;
}
.subtitle {
  text-align: center;
  margin: 14px 0 24px 0;
  color: #a5b4fc;
  font-size: 13px;
}
.slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}
.slot {
  background: #111322;
  border: 1px dashed #4338ca;
  padding: 16px;
  border-radius: 4px;
}
.slot-header {
  font-size: 11px;
  color: #38bdf8;
  font-weight: bold;
  margin-bottom: 6px;
}
.slot h4 {
  color: #f3f4f6;
  font-size: 14px;
  margin-bottom: 6px;
}
.slot p {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}
.status-bar {
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid #2d325a;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #818cf8;
}`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'demo-portfolio-mika-003',
    owner_id: 'demo-user-mika-uuid-003',
    title: "Mika Chen // Photographic Journal",
    html_code: `<div class="journal">
  <header>
    <span class="location">TOKYO &bull; BERLIN &bull; REYKJAVIK</span>
    <h2>MIKA CHEN</h2>
    <p class="bio">Exploring natural light, urban solitude, and brutalist architecture.</p>
  </header>

  <div class="gallery">
    <div class="frame frame-1">
      <div class="frame-content">
        <span class="roman">I</span>
        <h3>Dawn on Alexanderplatz</h3>
        <p>35mm film / Kodachrome 64</p>
      </div>
    </div>
    <div class="frame frame-2">
      <div class="frame-content">
        <span class="roman">II</span>
        <h3>Shibuya in the Monsoon</h3>
        <p>Medium format / Cinestill 800T</p>
      </div>
    </div>
  </div>

  <footer>
    <span>EXHIBITIONS: 2024–2026</span>
    <span>ARCHIVE NO. 441</span>
  </footer>
</div>`,
    css_code: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #121214;
  color: #ededed;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 32px 20px;
  display: flex;
  justify-content: center;
}
.journal {
  max-width: 640px;
  width: 100%;
}
header {
  border-bottom: 1px solid #26262a;
  padding-bottom: 24px;
  margin-bottom: 24px;
}
.location {
  font-size: 10px;
  letter-spacing: 2px;
  color: #888890;
  display: block;
  margin-bottom: 8px;
}
h2 {
  font-size: 26px;
  font-weight: 300;
  letter-spacing: 4px;
  color: #ffffff;
}
.bio {
  color: #a0a0ab;
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.5;
}
.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;
}
@media (max-width: 500px) {
  .gallery { grid-template-columns: 1fr; }
}
.frame {
  background: #1c1c21;
  border: 1px solid #2e2e36;
  border-radius: 8px;
  padding: 24px 18px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
}
.frame-1 { background: linear-gradient(180deg, #1c1c21 0%, #292833 100%); }
.frame-2 { background: linear-gradient(180deg, #1c1c21 0%, #202b35 100%); }
.roman {
  font-size: 12px;
  color: #71717a;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}
.frame h3 {
  font-size: 15px;
  font-weight: 500;
  color: #f4f4f5;
  margin-bottom: 4px;
}
.frame p {
  font-size: 11px;
  color: #a1a1aa;
}
footer {
  border-top: 1px solid #26262a;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #71717a;
  letter-spacing: 1px;
}`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

// In-browser mock client for demo/preview without credentials
class MockSupabaseClient {
  private listeners: ((event: string, session: any) => void)[] = [];

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (!localStorage.getItem('spg_profiles')) {
      localStorage.setItem('spg_profiles', JSON.stringify(INITIAL_DEMO_PROFILES));
    }
    if (!localStorage.getItem('spg_portfolios')) {
      localStorage.setItem('spg_portfolios', JSON.stringify(INITIAL_DEMO_PORTFOLIOS));
    }
    if (!localStorage.getItem('spg_users_auth')) {
      const authMap: Record<string, { id: string; email: string; password: string; nickname: string }> = {
        [nicknameToEmail('demo_ana')]: {
          id: 'demo-user-ana-uuid-001',
          email: nicknameToEmail('demo_ana'),
          password: DEMO_PASSWORD,
          nickname: 'demo_ana',
        },
        [nicknameToEmail('demo_leo')]: {
          id: 'demo-user-leo-uuid-002',
          email: nicknameToEmail('demo_leo'),
          password: DEMO_PASSWORD,
          nickname: 'demo_leo',
        },
        [nicknameToEmail('demo_mika')]: {
          id: 'demo-user-mika-uuid-003',
          email: nicknameToEmail('demo_mika'),
          password: DEMO_PASSWORD,
          nickname: 'demo_mika',
        },
      };
      localStorage.setItem('spg_users_auth', JSON.stringify(authMap));
    }
  }

  private getProfiles(): Profile[] {
    try {
      return JSON.parse(localStorage.getItem('spg_profiles') || '[]');
    } catch {
      return INITIAL_DEMO_PROFILES;
    }
  }

  private saveProfiles(profiles: Profile[]) {
    localStorage.setItem('spg_profiles', JSON.stringify(profiles));
  }

  private getPortfolios(): Portfolio[] {
    try {
      return JSON.parse(localStorage.getItem('spg_portfolios') || '[]');
    } catch {
      return INITIAL_DEMO_PORTFOLIOS;
    }
  }

  private savePortfolios(portfolios: Portfolio[]) {
    localStorage.setItem('spg_portfolios', JSON.stringify(portfolios));
  }

  private getAuthUsers(): Record<string, { id: string; email: string; password: string; nickname: string }> {
    try {
      return JSON.parse(localStorage.getItem('spg_users_auth') || '{}');
    } catch {
      return {};
    }
  }

  private saveAuthUsers(users: Record<string, any>) {
    localStorage.setItem('spg_users_auth', JSON.stringify(users));
  }

  private getCurrentSession(): any {
    try {
      const s = localStorage.getItem('spg_current_session');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  private setCurrentSession(session: any) {
    if (session) {
      localStorage.setItem('spg_current_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('spg_current_session');
    }
    this.listeners.forEach(cb => cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
  }

  auth = {
    getSession: async () => {
      const session = this.getCurrentSession();
      return { data: { session }, error: null };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const users = this.getAuthUsers();
      const user = users[email.toLowerCase()];
      if (!user) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      }
      if (user.password !== password) {
        return { data: { user: null, session: null }, error: { message: 'Incorrect password for this nickname.' } };
      }
      const sessionUser = { id: user.id, email: user.email, user_metadata: { nickname: user.nickname } };
      const session = {
        user: sessionUser,
        access_token: 'mock-token-' + user.id,
      };
      this.setCurrentSession(session);
      return { data: { user: sessionUser, session }, error: null };
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      const users = this.getAuthUsers();
      const normalizedEmail = email.toLowerCase();
      if (users[normalizedEmail]) {
        return { data: { user: null, session: null }, error: { message: 'User already registered' } };
      }
      const newId = 'user_' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
      const nickname = normalizedEmail.split('@')[0];
      users[normalizedEmail] = {
        id: newId,
        email: normalizedEmail,
        password,
        nickname,
      };
      this.saveAuthUsers(users);

      const sessionUser = { id: newId, email: normalizedEmail, user_metadata: { nickname } };
      const session = {
        user: sessionUser,
        access_token: 'mock-token-' + newId,
      };
      this.setCurrentSession(session);
      return { data: { user: sessionUser, session }, error: null };
    },
    signOut: async () => {
      this.setCurrentSession(null);
      return { error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.listeners.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.listeners = this.listeners.filter(l => l !== callback);
            },
          },
        },
      };
    },
  };

  from(table: string) {
    const self = this;
    const session = self.getCurrentSession();
    const currentUserId = session?.user?.id;

    return {
      select: (columns: string = '*') => {
        let filters: ((item: any) => boolean)[] = [];
        let orderBy: { field: string; ascending: boolean } | null = null;
        let single = false;

        const queryObj = {
          eq: (field: string, val: any) => {
            filters.push(item => item[field] === val);
            return queryObj;
          },
          order: (field: string, { ascending = true }: { ascending?: boolean } = {}) => {
            orderBy = { field, ascending };
            return queryObj;
          },
          single: () => {
            single = true;
            return queryObj;
          },
          then: async (resolve: any, reject?: any) => {
            try {
              let rows: any[] = [];
              if (table === 'profiles') {
                rows = self.getProfiles();
              } else if (table === 'portfolios') {
                // RLS simulation: only owner's portfolios can be selected
                const all = self.getPortfolios();
                rows = all.filter(p => p.owner_id === currentUserId);
              }

              for (const f of filters) {
                rows = rows.filter(f);
              }

              if (orderBy) {
                const { field, ascending } = orderBy;
                rows.sort((a, b) => {
                  if (a[field] < b[field]) return ascending ? -1 : 1;
                  if (a[field] > b[field]) return ascending ? 1 : -1;
                  return 0;
                });
              }

              if (single) {
                const row = rows[0] || null;
                resolve({ data: row, error: null });
              } else {
                resolve({ data: rows, error: null });
              }
            } catch (err: any) {
              if (reject) reject(err);
              else resolve({ data: null, error: err });
            }
          },
        };
        return queryObj;
      },
      insert: (record: any | any[]) => {
        const executeInsert = async () => {
          try {
            const records = Array.isArray(record) ? record : [record];
            if (table === 'profiles') {
              const profiles = self.getProfiles();
              for (const r of records) {
                profiles.unshift({
                  id: r.id,
                  nickname: r.nickname,
                  created_at: r.created_at || new Date().toISOString(),
                });
              }
              self.saveProfiles(profiles);
              return { data: records, error: null };
            } else if (table === 'portfolios') {
              const portfolios = self.getPortfolios();
              const created: Portfolio[] = [];
              for (const r of records) {
                const newPortfolio: Portfolio = {
                  id: r.id || 'portfolio_' + Math.random().toString(36).substring(2, 9),
                  owner_id: r.owner_id || currentUserId,
                  title: r.title || 'Untitled Portfolio',
                  html_code: r.html_code ?? '',
                  css_code: r.css_code ?? '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                portfolios.unshift(newPortfolio);
                created.push(newPortfolio);
              }
              self.savePortfolios(portfolios);
              return { data: created, error: null };
            }
            return { data: records, error: null };
          } catch (err: any) {
            return { data: null, error: err };
          }
        };

        return {
          select: () => ({
            single: () => ({
              then: async (resolve: any) => {
                const res = await executeInsert();
                if (res.error) return resolve(res);
                return resolve({ data: res.data ? res.data[0] : null, error: null });
              },
            }),
            then: async (resolve: any) => {
              const res = await executeInsert();
              resolve(res);
            },
          }),
          then: async (resolve: any) => {
            const res = await executeInsert();
            resolve(res);
          },
        };
      },
      update: (updates: any) => {
        return {
          eq: (field: string, val: any) => {
            const executeUpdate = async () => {
              try {
                if (table === 'portfolios') {
                  const portfolios = self.getPortfolios();
                  const index = portfolios.findIndex(
                    p => p[field as keyof Portfolio] === val && p.owner_id === currentUserId
                  );
                  if (index !== -1) {
                    portfolios[index] = {
                      ...portfolios[index],
                      ...updates,
                      updated_at: new Date().toISOString(),
                    };
                    self.savePortfolios(portfolios);
                    return { data: [portfolios[index]], error: null };
                  } else {
                    return {
                      data: null,
                      error: { message: 'Portfolio not found or unauthorized to edit.' },
                    };
                  }
                }
                return { data: [], error: null };
              } catch (err: any) {
                return { data: null, error: err };
              }
            };

            return {
              select: () => ({
                single: () => ({
                  then: async (resolve: any) => {
                    const res = await executeUpdate();
                    if (res.error) return resolve(res);
                    return resolve({ data: res.data ? res.data[0] : null, error: null });
                  },
                }),
                then: async (resolve: any) => {
                  const res = await executeUpdate();
                  resolve(res);
                },
              }),
              then: async (resolve: any) => {
                const res = await executeUpdate();
                resolve(res);
              },
            };
          },
        };
      },
      delete: () => {
        return {
          eq: (field: string, val: any) => {
            return {
              then: async (resolve: any) => {
                try {
                  if (table === 'portfolios') {
                    let portfolios = self.getPortfolios();
                    portfolios = portfolios.filter(p => !(p[field as keyof Portfolio] === val && p.owner_id === currentUserId));
                    self.savePortfolios(portfolios);
                    resolve({ data: null, error: null });
                  } else {
                    resolve({ data: null, error: null });
                  }
                } catch (err: any) {
                  resolve({ data: null, error: err });
                }
              },
            };
          },
        };
      },
    };
  }
}

export const supabase: SupabaseClient | any = isRealSupabase
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : new MockSupabaseClient();

export const SUPABASE_SCHEMA_SQL = `-- Run this in your Supabase SQL Editor:
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text unique not null,
  created_at timestamptz default now()
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  html_code text default '',
  css_code text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;

-- profiles: publicly readable nickname directory
create policy "nicknames are publicly readable"
  on public.profiles for select using (true);
create policy "users can create their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- portfolios: ONLY the owner can read or write
create policy "owners can read their own portfolios"
  on public.portfolios for select using (auth.uid() = owner_id);
create policy "owners can insert their own portfolios"
  on public.portfolios for insert with check (auth.uid() = owner_id);
create policy "owners can update their own portfolios"
  on public.portfolios for update using (auth.uid() = owner_id);
create policy "owners can delete their own portfolios"
  on public.portfolios for delete using (auth.uid() = owner_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_portfolios_updated_at
before update on public.portfolios
for each row execute function public.set_updated_at();
`;
