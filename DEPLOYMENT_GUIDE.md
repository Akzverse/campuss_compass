# Campus Compass - Deployment Guide

## Quick Start for GitHub

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Campus Compass - Smart Campus Navigation System"
git branch -M main
git remote add origin https://github.com/yourusername/campus-compass.git
git push -u origin main
```

### 2. Environment Setup

Create `.env.local` in project root:

```
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

These values are already configured in your Supabase project.

### 3. Build & Test Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to test the application.

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Advantages:**
- Zero configuration
- Automatic deployments on git push
- Global CDN
- Free tier available

**Steps:**

1. Sign up at [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

Your site will be live at `campus-compass.vercel.app`

### Option 2: Netlify

**Advantages:**
- Git-based deployment
- Built-in form handling
- Edge functions support
- Free tier with 300 minutes/month

**Steps:**

1. Sign up at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select GitHub and authorize
4. Choose your repository
5. Set build command: `npm run build`
6. Set publish directory: `dist`
7. Add environment variables
8. Click "Deploy site"

Your site will be live at `campus-compass.netlify.app`

### Option 3: GitHub Pages

**Advantages:**
- Free hosting
- No third-party account needed
- GitHub-native integration

**Steps:**

1. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/campus-compass/',
  plugins: [react()],
  // ...
})
```

2. Create GitHub Actions workflow (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. Push to GitHub (workflow runs automatically)

Your site will be live at `yourusername.github.io/campus-compass`

### Option 4: Firebase Hosting

**Advantages:**
- Google-backed platform
- Real-time database integration
- Analytics included
- Generous free tier

**Steps:**

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase login
firebase init hosting
```

3. Build project:
```bash
npm run build
```

4. Deploy:
```bash
firebase deploy
```

Your site will be live at `campus-compass-xxxxx.web.app`

---

## Supabase Setup

### Database Initialization (Already Done)

The database schema is automatically created when you:

1. Create a new Supabase project
2. Run the migrations from `SETUP.md`

### Verify Database

Access your database at: `https://app.supabase.com/project/[project-id]/editor`

Check that these tables exist:
- ✓ buildings
- ✓ floors
- ✓ locations
- ✓ waypoints
- ✓ navigation_steps

### Data Verification

Sample query to verify demo data:

```sql
SELECT b.name, COUNT(l.id) as location_count
FROM buildings b
LEFT JOIN floors f ON f.building_id = b.id
LEFT JOIN locations l ON l.floor_id = f.id
GROUP BY b.id, b.name;
```

Expected output:
```
Academic Block A    | 7
Academic Block B    | 2
Laboratory Complex  | 5
Administrative      | 4
Faculty Block       | 2
```

---

## Environment Variables

### Required Variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Getting Your Values

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### Local Development

Create `.env.local`:
```
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

### Production (Vercel/Netlify)

1. Go to project settings
2. Add environment variables
3. Redeploy

---

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/build-test.yml`:

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run typecheck
      - run: npm run lint
```

---

## Performance Optimization

### Build Optimization

Current build size: ~765 KB (with Three.js)

To reduce size:
1. **Code splitting:**
```typescript
const ARVisualization = lazy(() => import('./components/ARVisualization'));
```

2. **Tree shaking:**
```bash
npm run build
# Check dist folder size
```

3. **Image optimization:**
- Use Pexels images (external CDN)
- Lazy load images in navigation system
- WebP format for browser support

### Runtime Performance

1. **Database Queries:**
- Use `.select()` with specific fields
- Filter at database level (role_access)
- Avoid N+1 queries with joins

2. **React Optimization:**
- Memoize expensive components
- Use useCallback for event handlers
- Virtualize long location lists

3. **AR Rendering:**
- Dispose geometries properly
- Limit node count in visualization
- Use LOD (Level of Detail) for performance

---

## Monitoring & Debugging

### Local Development

```bash
npm run dev
```

Browser DevTools:
- Performance tab for rendering metrics
- Network tab for API calls
- Console for error messages

### Production

**Vercel:**
- Go to project dashboard
- View "Analytics" tab
- Monitor build logs

**Netlify:**
- Go to site settings
- View "Analytics" and "Functions"
- Monitor production errors

**Supabase:**
- Database logs in project dashboard
- Edge Function execution logs
- API authentication errors

### Common Issues

**"Cannot read property of undefined"**
- Verify Supabase credentials in `.env`
- Check database tables exist
- Inspect network tab for API errors

**3D visualization not rendering**
- Browser WebGL support required
- Check console for Three.js errors
- Verify GPU acceleration enabled

**Pathfinding returns empty result**
- Verify locations exist in database
- Check role_access array includes selected role
- Confirm navigation_steps exist

---

## Update & Maintenance

### Updating Dependencies

```bash
npm update
npm audit fix
```

### Database Migrations

To add new buildings or locations:

1. Use Supabase dashboard UI
2. Or execute SQL:

```sql
INSERT INTO buildings (name, code, type, description)
VALUES ('New Building', 'NB', 'academic', 'Description here');
```

### Deploying Updates

1. Make code changes
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Commit: `git commit -m "Feature: description"`
5. Push: `git push origin main`
6. Deployment automatic on Vercel/Netlify/GH Pages

---

## Security Checklist

- ✓ API keys in environment variables only
- ✓ No hardcoded credentials in code
- ✓ RLS policies enabled on all tables
- ✓ Public read-only access for demo
- ✓ CORS headers configured in Edge Functions
- ✓ No sensitive data in error messages

---

## Support

**For Issues:**
1. Check error messages in browser console
2. Review deployment logs
3. Verify environment variables
4. Check Supabase dashboard for data

**Contact:**
- Akshaya A
- Karuna Mariyam Babu
- Gopika N K

**Repository:** https://github.com/yourusername/campus-compass

---

## License

MIT License - Feel free to use and modify for your institution
