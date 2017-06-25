import {Component, OnInit, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit} from '@angular/core';
import {WizardStepComponent} from './wizard-step.component';

@Component({
    selector: 'form-wizard',
    template: `<div class="card">
    <div class="card-header">
      <ul class="nav nav-justified">
        <li class="nav-item" *ngFor="let step of steps" [ngClass]="{'active': step.isActive, 'enabled': !step.isDisabled, 'disabled': step.isDisabled, 'completed': isCompleted}">
          <a (click)="goToStep(step)">{{step.title}}</a>
        </li>
      </ul>
    </div>
    <div class="card-block">
      <ng-content></ng-content>
    </div>
    <div class="card-footer" [hidden]="isCompleted">
        <button type="button" class="btn btn-primary float-left col-5 col-sm-6 col-md-3 col-lg-2 col-xl-2" (click)="previous()" [hidden]="!hasPrevStep || !activeStep.showPrev">Anterior</button>
        <button type="button" class="btn btn-primary float-right col-5 col-sm-6 col-md-3 col-lg-2 col-xl-2" (click)="next()" [disabled]="!activeStep.isValid" [hidden]="!hasNextStep || !activeStep.showNext">Siguiente</button>
        <button type="button" class="btn btn-primary float-right col-5 col-sm-6 col-md-3 col-lg-2 col-xl-2" (click)="complete()" [disabled]="!activeStep.isValid" [hidden]="hasNextStep">Confirmar</button>
    </div>
    <div class="card-footer" [hidden]="!isCompleted">
        <button type="button" class="btn btn-primary float-right col-6 col-sm-6 col-md-3 col-lg-2 col-xl-2" (click)="reset()">Nuevo</button>
    </div>
  </div>`
    ,
    styles: [
        '.card { height: 100%; }',
        '.card-header { background-color: #fff; padding: 0; font-size: 1rem; }',
        '.card-block { overflow-y: auto; padding: 0.6rem;}',
        '.card-footer { background-color: #fff; border-top: 0 none; }',
        '.nav-item { padding: 1rem 0rem; border-bottom: 0.5rem solid #ccc; }',
        '.active { font-weight: bold; color: black; border-bottom-color: #1976D2 !important; }',
        '.enabled { cursor: pointer; border-bottom-color: rgb(88, 162, 234); }',
        '.disabled { color: #ccc; }',
        '.completed { cursor: default; }'
    ]
})
export class WizardComponent implements OnInit, AfterContentInit {
    @ContentChildren(WizardStepComponent)
    wizardSteps: QueryList<WizardStepComponent>;

    private _steps: Array<WizardStepComponent> = [];
    private _isCompleted: boolean = false;

    @Output()
    onStepChanged: EventEmitter<WizardStepComponent> = new EventEmitter<WizardStepComponent>();

    @Output()
    onReset: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterContentInit() {
        this.wizardSteps.forEach(step => this._steps.push(step));
        this.steps[0].isActive = true;
    }

    get steps(): Array<WizardStepComponent> {
        return this._steps.filter(step => !step.hidden);
    }

    get isCompleted(): boolean {
        return this._isCompleted;
    }

    get activeStep(): WizardStepComponent {
        return this.steps.find(step => step.isActive);
    }

    set activeStep(step: WizardStepComponent) {
        if (step !== this.activeStep && !step.isDisabled) {
            this.activeStep.isActive = false;
            step.isActive = true;
            this.onStepChanged.emit(step);
        }
    }

    private get activeStepIndex(): number {
        return this.steps.indexOf(this.activeStep);
    }

    get hasNextStep(): boolean {
        return this.activeStepIndex < this.steps.length - 1;
    }

    get hasPrevStep(): boolean {
        return this.activeStepIndex > 0;
    }

    goToStep(step: WizardStepComponent) {
        if (!this.isCompleted) {
            this.activeStep = step;
        }
    }

    next() {
        if (this.hasNextStep) {
            let nextStep: WizardStepComponent = this.steps[this.activeStepIndex + 1];
            this.activeStep.onNext.emit();
            nextStep.isDisabled = false;
            this.activeStep = nextStep;
        }
    }

    previous() {
        if (this.hasPrevStep) {
            let prevStep: WizardStepComponent = this.steps[this.activeStepIndex - 1];
            this.activeStep.onPrev.emit();
            prevStep.isDisabled = false;
            this.activeStep = prevStep;
        }
    }

    complete() {
        this.activeStep.onComplete.emit();
        this._isCompleted = true;
    }

    reset() {
        this.activeStep = this.steps[0];
        for (let step of this.steps) {
            step.isDisabled = true;
        }
        this.activeStep.isDisabled = false;
        this.activeStep.isActive = true;
        this._isCompleted = false;

        this.onReset.emit(true);
    }

}
