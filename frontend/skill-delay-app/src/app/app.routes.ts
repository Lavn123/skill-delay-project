import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CvUploadComponent } from './components/cv-upload/cv-upload';
import { SkillDashboard} from './components/skill-dashboard/skill-dashboard';
import { JobMatchesComponent } from './components/job-matches/job-matches';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload', component: CvUploadComponent },
  { path: 'dashboard', component: SkillDashboard },
  { path: 'jobs', component: JobMatchesComponent }
];