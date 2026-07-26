import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CvUploadComponent } from './components/cv-upload/cv-upload';
import { SkillDashboardComponent } from './components/skill-dashboard/skill-dashboard';
import { JobMatchesComponent } from './components/job-matches/job-matches';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { HistoryComponent } from './components/history/history';
import { authGuard } from './guards/auth-guard';
import { ComparisonDashboardComponent } from './components/comparison-dashboard/comparison-dashboard';
import { EvaluationComponent } from './components/evaluation/evaluation';




export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes — require login
  { path: 'upload', component: CvUploadComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: SkillDashboardComponent, canActivate: [authGuard] },
  { path: 'jobs', component: JobMatchesComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
{ path: 'comparison', component: ComparisonDashboardComponent, canActivate: [authGuard] },
{ path: 'evaluation', component: EvaluationComponent, canActivate: [authGuard] },
];