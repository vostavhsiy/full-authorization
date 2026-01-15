import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from '@nestjs/class-validator';

@ValidatorConstraint({ name: 'IsRepeatsPassword', async: false })
export class IsRepeatsPassword implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    const object = args.object as any;
    return text === object.password;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Пароли не совпадают';
  }
}
