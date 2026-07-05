import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh; background:linear-gradient(135deg, #f5f7fa, #e8f0fe);">
      
      <!-- Hero Section -->
      <div style="text-align:center; padding:80px 20px 60px;">
        <div style="font-size:60px; margin-bottom:20px;">🎯</div>
        <h1 style="color:#1F3864; font-size:48px; margin:0 0 20px; 
                   font-weight:800; line-height:1.2;">
          Skill Decay Analyser
        </h1>
        <p style="font-size:20px; color:#555; max-width:650px; 
                  margin:0 auto 40px; line-height:1.6;">
          Stop getting judged by outdated skills. Our AI analyses 
          <strong>when</strong> you used each skill — not just whether 
          you have it.
        </p>
        <a routerLink="/upload">
          <button style="background:linear-gradient(135deg, #2E75B6, #1F3864); 
                         color:white; padding:16px 50px; font-size:18px; 
                         border:none; border-radius:30px; cursor:pointer;
                         box-shadow:0 4px 15px rgba(46,117,182,0.4);
                         transition:transform 0.2s;"
                  onmouseover="this.style.transform='translateY(-2px)'"
                  onmouseout="this.style.transform='translateY(0)'">
            Analyse My Skills →
          </button>
        </a>
      </div>

      <!-- How It Works -->
      <div style="padding:20px 40px 60px;">
        <h2 style="text-align:center; color:#1F3864; font-size:32px; 
                   margin-bottom:40px;">How It Works</h2>
        <div style="display:flex; justify-content:center; gap:30px; 
                    flex-wrap:wrap; max-width:1000px; margin:0 auto;">
          
          <div style="background:white; padding:35px 30px; border-radius:16px; 
                      width:220px; text-align:center;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size:45px; margin-bottom:15px;">📄</div>
            <h3 style="color:#1F3864; margin:0 0 10px;">1. Upload CV</h3>
            <p style="color:#777; font-size:14px; margin:0;">
              Paste your CV text and optionally link your GitHub profile
            </p>
          </div>

          <div style="background:white; padding:35px 30px; border-radius:16px; 
                      width:220px; text-align:center;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size:45px; margin-bottom:15px;">⏳</div>
            <h3 style="color:#1F3864; margin:0 0 10px;">2. Decay Analysis</h3>
            <p style="color:#777; font-size:14px; margin:0;">
              Our AI calculates how fresh each skill is based on when you last used it
            </p>
          </div>

          <div style="background:white; padding:35px 30px; border-radius:16px; 
                      width:220px; text-align:center;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size:45px; margin-bottom:15px;">💼</div>
            <h3 style="color:#1F3864; margin:0 0 10px;">3. Job Matches</h3>
            <p style="color:#777; font-size:14px; margin:0;">
              Get ranked job matches based on your actual current skill strength
            </p>
          </div>

          <div style="background:white; padding:35px 30px; border-radius:16px; 
                      width:220px; text-align:center;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="font-size:45px; margin-bottom:15px;">📈</div>
            <h3 style="color:#1F3864; margin:0 0 10px;">4. Upskill</h3>
            <p style="color:#777; font-size:14px; margin:0;">
              See which skills are decaying and get personalised upskilling advice
            </p>
          </div>

        </div>
      </div>

      <!-- Why Different -->
      <div style="background:linear-gradient(135deg, #1F3864, #2E75B6); 
                  padding:60px 40px; text-align:center;">
        <h2 style="color:white; font-size:32px; margin-bottom:40px;">
          Why We're Different
        </h2>
        <div style="display:flex; justify-content:center; gap:60px; 
                    flex-wrap:wrap; max-width:800px; margin:0 auto;">
          <div style="color:white;">
            <div style="font-size:40px; margin-bottom:10px;">❌</div>
            <h3 style="margin:0 0 8px;">Traditional ATS</h3>
            <p style="opacity:0.8; font-size:14px;">
              "Do you have Python?" ✓
            </p>
          </div>
          <div style="color:white; font-size:40px; padding-top:20px;">→</div>
          <div style="color:white;">
            <div style="font-size:40px; margin-bottom:10px;">✅</div>
            <h3 style="margin:0 0 8px;">Skill Decay</h3>
            <p style="opacity:0.8; font-size:14px;">
              "Do you still have Python?" 🎯
            </p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class HomeComponent {}