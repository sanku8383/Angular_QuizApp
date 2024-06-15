import { Component, inject } from '@angular/core';
import { TestService } from '../../services/test.service';
import { QuizResult } from '../../Types';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quiz-score',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-score.component.html',
  styleUrl: './quiz-score.component.css'
})
export class QuizScoreComponent {
testService=inject(TestService);
quizResult!:QuizResult;
router = inject(Router);
ngOnInit(){
  this.quizResult = this.testService.quizResult;
    if (!this.quizResult) {
      this.router.navigateByUrl('/');
      return;
    }
  let quizResultId= this.testService.quizResult.id!;
  this.testService.getQuizResult(quizResultId).subscribe(result=>{
   this.quizResult=result;
  })
}
}