import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div style="min-height:100vh; background:var(--gradient-bg);">

      <!-- Hero -->
      <div style="padding:80px 40px 60px; text-align:center;
                  max-width:860px; margin:0 auto;">

        <div class="animate-fade-up">
          <span style="display:inline-flex; align-items:center; gap:6px;
                       background:rgba(255,255,255,0.8);
                       border:0.5px solid var(--border-strong);
                       color:var(--text-accent); font-size:12px;
                       padding:5px 14px; border-radius:var(--radius-full);
                       margin-bottom:28px;">
            🎓 MSc AI & ML · University of Birmingham
          </span>
        </div>

        <h1 class="animate-fade-up-delay-1"
            style="font-size:clamp(32px,5vw,52px); font-weight:700;
                   line-height:1.1; margin-bottom:20px; letter-spacing:-1.5px;
                   color:var(--text-primary);">
          Smarter matching.<br>
          <span style="color:var(--color-primary);">
            Skills have an expiry date.
          </span>
        </h1>

        <p class="animate-fade-up-delay-2"
           style="font-size:17px; color:var(--text-secondary);
                  max-width:520px; margin:0 auto 36px; line-height:1.7;">
          Current ATS treats a skill from 2015 the same as one from
          last month. SkillTempus applies temporal decay so your
          freshest skills carry the most weight.
        </p>

        <div class="animate-fade-up-delay-3"
             style="display:flex; gap:12px; justify-content:center;
                    margin-bottom:60px; flex-wrap:wrap;">
          <a routerLink="/upload" class="btn-primary"
             style="text-decoration:none; font-size:15px; padding:14px 32px;">
            Analyse my CV →
          </a>
          <a routerLink="/evaluation" class="btn-secondary"
             style="text-decoration:none; font-size:15px; padding:14px 32px;">
            See the research
          </a>
        </div>

        <!-- Stat Cards -->
        <div class="animate-fade-up-delay-4"
             style="display:grid; grid-template-columns:repeat(3,1fr);
                    gap:16px; max-width:640px; margin:0 auto;">

          <div class="stat-card animate-float">
            <span class="stat-number" id="stat-acc">0%</span>
            <div class="stat-label">Best model accuracy</div>
          </div>

          <div class="stat-card animate-float"
               style="animation-delay:0.5s;">
            <span class="stat-number" id="stat-jobs">0</span>
            <div class="stat-label">Real job postings</div>
          </div>

          <div class="stat-card animate-float"
               style="animation-delay:1s;">
            <span class="stat-number" id="stat-imp">0%</span>
            <div class="stat-label">Accuracy gain over ATS</div>
          </div>

        </div>
      </div>

      <!-- Problem Section -->
      <div style="padding:60px 40px; max-width:1000px; margin:0 auto;">

        <div style="text-align:center; margin-bottom:40px;">
          <div style="font-size:11px; font-weight:600; letter-spacing:1.5px;
                      text-transform:uppercase; color:var(--text-accent);
                      margin-bottom:10px;">
            The problem
          </div>
          <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                     color:var(--text-primary); margin-bottom:12px;">
            ATS ignores when you used a skill
          </h2>
          <p style="color:var(--text-secondary); max-width:480px; margin:0 auto;">
            A skill used once in 2015 gets 100% — same as one you use
            every day. SkillTempus corrects this.
          </p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">

          <!-- System A -->
          <div class="glass-card" style="padding:28px;">
            <span style="background:var(--color-danger-bg);
                         color:var(--color-danger); font-size:11px;
                         padding:3px 10px; border-radius:var(--radius-full);
                         font-weight:500; display:inline-block; margin-bottom:16px;">
              ❌ Current ATS — System A
            </span>
            <div style="font-size:14px; font-weight:600;
                        color:var(--text-primary); margin-bottom:16px;">
              All skills score 100% — always
            </div>
            <div *ngFor="let s of skillsA"
                 style="display:flex; align-items:center; gap:10px;
                        padding:8px 0; border-bottom:0.5px solid var(--border-default);">
              <span style="flex:1; font-size:13px; color:var(--text-secondary);">
                {{ s.name }} ({{ s.year }})
              </span>
              <div style="background:#f0f0f0; border-radius:var(--radius-full);
                          height:6px; width:80px; overflow:hidden;">
                <div style="width:100%; height:100%; background:var(--color-danger);
                             border-radius:var(--radius-full);"></div>
              </div>
              <span style="font-size:12px; font-weight:600;
                           color:var(--color-danger);
                           background:var(--color-danger-bg);
                           padding:2px 8px; border-radius:var(--radius-full);">
                100%
              </span>
            </div>
          </div>

          <!-- System C -->
          <div class="glass-card" style="padding:28px;
               border-color:rgba(99,102,241,0.3);">
            <span style="background:var(--color-success-bg);
                         color:var(--color-success); font-size:11px;
                         padding:3px 10px; border-radius:var(--radius-full);
                         font-weight:500; display:inline-block; margin-bottom:16px;">
              ✅ SkillTempus — System C
            </span>
            <div style="font-size:14px; font-weight:600;
                        color:var(--text-primary); margin-bottom:16px;">
              Scores reflect actual freshness
            </div>
            <div *ngFor="let s of skillsC"
                 style="display:flex; align-items:center; gap:10px;
                        padding:8px 0; border-bottom:0.5px solid var(--border-default);">
              <span style="flex:1; font-size:13px; color:var(--text-secondary);">
                {{ s.name }} ({{ s.year }})
              </span>
              <div style="background:#f0f0f0; border-radius:var(--radius-full);
                          height:6px; width:80px; overflow:hidden;">
                <div [style.width.%]="s.score"
                     [class]="'bar-animate bar-' + s.strength"
                     style="height:100%; border-radius:var(--radius-full);">
                </div>
              </div>
              <span [class]="'badge badge-' + s.strength">
                {{ s.score }}%
              </span>
            </div>
          </div>

        </div>
      </div>

      <!-- How It Works -->
      <div style="padding:60px 40px; background:rgba(255,255,255,0.4);
                  backdrop-filter:blur(8px);
                  border-top:0.5px solid var(--border-default);
                  border-bottom:0.5px solid var(--border-default);">
        <div style="max-width:1000px; margin:0 auto;">

          <div style="text-align:center; margin-bottom:40px;">
            <div style="font-size:11px; font-weight:600; letter-spacing:1.5px;
                        text-transform:uppercase; color:var(--text-accent);
                        margin-bottom:10px;">
              How it works
            </div>
            <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                       color:var(--text-primary);">
              Four steps to smarter matching
            </h2>
          </div>

          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px;">
            <div *ngFor="let step of steps; let i = index"
                 class="glass-card"
                 style="padding:24px;">
              <div style="width:36px; height:36px;
                          background:var(--color-primary-light);
                          border-radius:var(--radius-md);
                          display:flex; align-items:center; justify-content:center;
                          color:var(--color-primary); font-size:16px;
                          font-weight:700; margin-bottom:16px;">
                {{ step.icon }}
              </div>
              <div style="font-size:14px; font-weight:600;
                          color:var(--text-primary); margin-bottom:8px;">
                {{ step.title }}
              </div>
              <div style="font-size:13px; color:var(--text-secondary);
                          line-height:1.6;">
                {{ step.desc }}
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Results -->
      <div style="padding:60px 40px; max-width:800px; margin:0 auto;">

        <div style="text-align:center; margin-bottom:40px;">
          <div style="font-size:11px; font-weight:600; letter-spacing:1.5px;
                      text-transform:uppercase; color:var(--text-accent);
                      margin-bottom:10px;">
            Evaluation results
          </div>
          <h2 style="font-size:32px; font-weight:700; letter-spacing:-0.5px;
                     color:var(--text-primary); margin-bottom:12px;">
            Proven on 60 test cases
          </h2>
          <p style="color:var(--text-secondary);">
            Synthetic evaluation · 20 candidates · 3 job roles ·
            p = 0.0327 ✅
          </p>
        </div>

        <div class="glass-card" style="padding:32px;">
          <div *ngFor="let r of results"
               style="display:flex; align-items:center; gap:16px;
                      margin-bottom:20px;">
            <span style="font-size:13px; color:var(--text-secondary);
                         width:200px; flex-shrink:0;">
              {{ r.label }}
            </span>
            <div style="flex:1; background:rgba(0,0,0,0.06);
                        border-radius:var(--radius-full); height:10px;
                        overflow:hidden;">
              <div [style.width]="r.animated ? r.pct + '%' : '0%'"
                   [style.background]="r.color"
                   style="height:100%; border-radius:var(--radius-full);
                          transition:width 1.2s cubic-bezier(0.4,0,0.2,1);">
              </div>
            </div>
            <span [style.color]="r.color"
                  style="font-size:14px; font-weight:700;
                         width:52px; text-align:right;">
              {{ r.pct }}%
            </span>
          </div>

          <div style="margin-top:24px; padding-top:20px;
                      border-top:0.5px solid var(--border-default);
                      display:flex; gap:20px; flex-wrap:wrap;">
            <div style="text-align:center; flex:1;">
              <div style="font-size:22px; font-weight:700;
                          color:var(--color-success);">p = 0.0327</div>
              <div style="font-size:11px; color:var(--text-muted);
                          text-transform:uppercase; letter-spacing:0.5px;">
                Statistically significant ✅
              </div>
            </div>
            <div style="text-align:center; flex:1;">
              <div style="font-size:22px; font-weight:700;
                          color:var(--color-primary);">0.746</div>
              <div style="font-size:11px; color:var(--text-muted);
                          text-transform:uppercase; letter-spacing:0.5px;">
                NDCG@3 score
              </div>
            </div>
            <div style="text-align:center; flex:1;">
              <div style="font-size:22px; font-weight:700;
                          color:var(--color-success);">7 → 0</div>
              <div style="font-size:11px; color:var(--text-muted);
                          text-transform:uppercase; letter-spacing:0.5px;">
                False positives eliminated
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formula Section -->
      <div style="padding:40px; background:rgba(255,255,255,0.4);
                  backdrop-filter:blur(8px);
                  border-top:0.5px solid var(--border-default);
                  border-bottom:0.5px solid var(--border-default);">
        <div style="max-width:700px; margin:0 auto; text-align:center;">
          <div style="font-size:11px; font-weight:600; letter-spacing:1.5px;
                      text-transform:uppercase; color:var(--text-accent);
                      margin-bottom:16px;">
            The formula
          </div>
          <div class="glass-card"
               style="padding:28px; display:inline-block; width:100%;">
            <div style="font-size:28px; font-weight:300; letter-spacing:2px;
                        color:var(--text-primary); margin-bottom:16px;
                        font-family:Georgia, serif;">
              S(t) = e<sup style="font-size:16px;">−λt</sup>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3,1fr);
                        gap:16px; text-align:left;">
              <div style="padding:12px; background:var(--color-primary-light);
                          border-radius:var(--radius-md);">
                <div style="font-size:12px; font-weight:600;
                             color:var(--color-primary);">Fast decay λ=0.3</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
                  Frameworks: Angular, React, TensorFlow
                </div>
              </div>
              <div style="padding:12px; background:var(--color-primary-light);
                          border-radius:var(--radius-md);">
                <div style="font-size:12px; font-weight:600;
                             color:var(--color-primary);">Medium decay λ=0.2</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
                  Languages: Python, JavaScript, Java
                </div>
              </div>
              <div style="padding:12px; background:var(--color-primary-light);
                          border-radius:var(--radius-md);">
                <div style="font-size:12px; font-weight:600;
                             color:var(--color-primary);">Slow decay λ=0.1</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
                  Fundamentals: SQL, Git, HTML
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center; padding:80px 40px;">
        <h2 style="font-size:36px; font-weight:700; letter-spacing:-0.5px;
                   color:var(--text-primary); margin-bottom:12px;">
          Ready to see your real skill profile?
        </h2>
        <p style="color:var(--text-secondary); margin-bottom:32px; font-size:16px;">
          Upload your CV and get matched based on when you actually used each skill.
        </p>
        <a routerLink="/upload" class="btn-primary animate-pulse"
           style="font-size:16px; padding:16px 40px; text-decoration:none;">
          Analyse my CV →
        </a>
      </div>

    </div>
  `
})
export class HomeComponent implements OnInit, AfterViewInit {

  skillsA = [
    { name: 'Python', year: 2024 },
    { name: 'TensorFlow', year: 2024 },
    { name: 'Angular', year: 2020 },
    { name: 'Java', year: 2016 },
    { name: 'jQuery', year: 2015 }
  ];

  skillsC = [
    { name: 'Python', year: 2024, score: 67, strength: 'moderate' },
    { name: 'TensorFlow', year: 2024, score: 82, strength: 'strong' },
    { name: 'Angular', year: 2020, score: 45, strength: 'moderate' },
    { name: 'Java', year: 2016, score: 22, strength: 'weak' },
    { name: 'jQuery', year: 2015, score: 8, strength: 'outdated' }
  ];

  steps = [
    {
      icon: '📄',
      title: 'Upload your CV',
      desc: 'PDF or DOCX. We extract every skill and when you used it.'
    },
    {
      icon: '⏳',
      title: 'Decay scoring',
      desc: 'Each skill gets a freshness score using S(t) = e^(−λt).'
    },
    {
      icon: '🐙',
      title: 'GitHub signals',
      desc: 'We check your public repos to catch skills used in personal projects.'
    },
    {
      icon: '💼',
      title: 'Ranked matches',
      desc: 'Jobs ranked by your actual current skill strength — not keywords.'
    }
  ];

  results = [
    {
      label: 'System A — Static ATS',
      pct: 75.0,
      color: '#dc2626',
      animated: false
    },
    {
      label: 'System B — CV decay only',
      pct: 81.7,
      color: '#4f46e5',
      animated: false
    },
    {
      label: 'System C — CV + GitHub',
      pct: 85.0,
      color: '#059669',
      animated: false
    }
  ];

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.animateCounter('stat-acc', 85.0, '%', 1500);
      this.animateCounter('stat-jobs', 1943, '', 1500);
      this.animateCounter('stat-imp', 10, '%', 1500);
    }, 400);

    setTimeout(() => {
      this.results = this.results.map(r => ({ ...r, animated: true }));
    }, 600);
  }

  animateCounter(
    id: string,
    target: number,
    suffix: string,
    duration: number
  ) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = (
        Number.isInteger(target)
          ? Math.round(start)
          : Math.round(start * 10) / 10
      ) + suffix;
      if (start >= target) clearInterval(timer);
    }, 16);
  }
}