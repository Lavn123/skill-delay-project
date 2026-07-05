import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CvUploadComponent } from './components/cv-upload/cv-upload';
import { SkillDashboardComponent } from './components/skill-dashboard/skill-dashboard';
import { JobMatchesComponent } from './components/job-matches/job-matches';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload', component: CvUploadComponent },
  { path: 'dashboard', component: SkillDashboardComponent },
  { path: 'jobs', component: JobMatchesComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];