import * as React from 'react';
import { spy } from 'sinon';
import { adapterToUse, getAllFieldInputRoot } from 'test/utils/pickers';
import { act } from '@mui/internal-test-utils/createRenderer';
import { vi } from 'vitest';
import { DescribeRangeValidationTestSuite } from './describeRangeValidation.types';

const testInvalidStatus = (
  expectedAnswer: boolean[],
  fieldType: 'single-input' | 'multi-input' | 'no-input',
) => {
  const answers =
    fieldType === 'multi-input' ? expectedAnswer : [expectedAnswer[0] || expectedAnswer[1]];

  const fieldInputRoots = getAllFieldInputRoot();
  answers.forEach((answer, index) => {
    const fieldInputRoot = fieldInputRoots[index];

    expect(fieldInputRoot).to.have.attribute('aria-invalid', answer ? 'true' : 'false');
  });
};

export const testTextFieldKeyboardRangeValidation: DescribeRangeValidationTestSuite = (
  ElementToTest,
  getOptions,
) => {
  const { componentFamily, render, fieldType, withDate, withTime, setValue } = getOptions();

  describe.skipIf(componentFamily !== 'field' || !setValue)('text field keyboard:', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const setValue = getOptions().setValue!;

    it('should not accept end date prior to start state', () => {
      const onErrorMock = spy();
      render(<ElementToTest onError={onErrorMock} />);

      expect(onErrorMock.callCount).to.equal(0);
      act(() => {
        [
          adapterToUse.date('2018-01-02T12:00:00'),
          adapterToUse.date('2018-01-01T11:00:00'),
        ].forEach((date, index) => {
          setValue(date, { setEndDate: index === 1 });
        });
      });
      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['invalidRange', 'invalidRange']);
      testInvalidStatus([true, true], fieldType);
    });

    it.skipIf(!withDate)('should apply shouldDisableDate', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          shouldDisableDate={(date: any) =>
            adapterToUse.isAfter(date, adapterToUse.date('2018-03-11'))
          }
        />,
      );
      act(() => {
        [adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-10')].forEach(
          (date, index) => {
            setValue(date, { setEndDate: index === 1 });
          },
        );
      });

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      act(() => {
        setValue(adapterToUse.date('2018-03-13'), { setEndDate: true });
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'shouldDisableDate']);
      testInvalidStatus([false, true], fieldType);

      act(() => {
        setValue(adapterToUse.date('2018-03-12'));
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([
        'shouldDisableDate',
        'shouldDisableDate',
      ]);
      testInvalidStatus([true, true], fieldType);

      setProps({
        shouldDisableDate: (date: any) =>
          adapterToUse.isBefore(date, adapterToUse.date('2018-03-13')),
      });

      expect(onErrorMock.callCount).to.equal(3);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['shouldDisableDate', null]);
      testInvalidStatus([true, false], fieldType);
    });
    describe('with fake timers', () => {
      beforeEach(() => {
        vi.setSystemTime(new Date(2018, 0, 1));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should apply disablePast', () => {
        const onErrorMock = spy();
        const now = adapterToUse.date();
        render(<ElementToTest disablePast onError={onErrorMock} />);

        let past: null | typeof now = null;
        if (withDate) {
          past = adapterToUse.addDays(now, -1);
        } else if (adapterToUse.isSameDay(adapterToUse.addHours(now, -1), now)) {
          past = adapterToUse.addHours(now, -1);
        }

        if (past === null) {
          return;
        }

        act(() => {
          setValue(past);
        });

        expect(onErrorMock.callCount).to.equal(1);
        expect(onErrorMock.lastCall.args[0]).to.deep.equal(['disablePast', null]);
        testInvalidStatus([true, false], fieldType);

        act(() => {
          setValue(past, { setEndDate: true });
        });

        expect(onErrorMock.callCount).to.equal(2);
        expect(onErrorMock.lastCall.args[0]).to.deep.equal(['disablePast', 'disablePast']);
        testInvalidStatus([true, true], fieldType);

        act(() => {
          setValue(now);
        });
        expect(onErrorMock.callCount).to.equal(3);
        expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'disablePast']);
        testInvalidStatus([false, true], fieldType);
      });
    });

    it('should apply disableFuture', () => {
      const onErrorMock = spy();
      const now = adapterToUse.date();
      render(<ElementToTest disableFuture onError={onErrorMock} />);

      let future: null | typeof now = null;

      if (withDate) {
        future = adapterToUse.addDays(now, 1);
      } else if (adapterToUse.isSameDay(adapterToUse.addHours(now, 1), now)) {
        future = adapterToUse.addHours(now, 1);
      }

      if (future === null) {
        return;
      }

      act(() => {
        setValue(future, { setEndDate: true });
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'disableFuture']);
      testInvalidStatus([false, true], fieldType);

      act(() => {
        setValue(future);
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['disableFuture', 'disableFuture']);
      testInvalidStatus([true, true], fieldType);

      act(() => {
        setValue(now);
      });

      expect(onErrorMock.callCount).to.equal(3);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'disableFuture']);
      testInvalidStatus([false, true], fieldType);
    });

    it.skipIf(!withDate)('should apply minDate', () => {
      const onErrorMock = spy();
      render(<ElementToTest onError={onErrorMock} minDate={adapterToUse.date('2018-03-15')} />);

      act(() => {
        [adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-10')].forEach(
          (date, index) => {
            setValue(date, { setEndDate: index === 1 });
          },
        );
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minDate', 'minDate']);
      testInvalidStatus([true, true], fieldType);

      act(() => {
        setValue(adapterToUse.date('2018-03-15'));
      });

      expect(onErrorMock.callCount).to.equal(3);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'minDate']);
      testInvalidStatus([false, true], fieldType);

      act(() => {
        setValue(adapterToUse.date('2018-03-16'), { setEndDate: true });
      });

      expect(onErrorMock.callCount).to.equal(4);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });

    it.skipIf(!withDate)('should apply maxDate', () => {
      const onErrorMock = spy();
      render(<ElementToTest onError={onErrorMock} maxDate={adapterToUse.date('2018-03-15')} />);

      act(() => {
        [adapterToUse.date('2018-03-15'), adapterToUse.date('2018-03-17')].forEach(
          (date, index) => {
            setValue(date, { setEndDate: index === 1 });
          },
        );
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'maxDate']);
      testInvalidStatus([false, true], fieldType);

      act(() => {
        setValue(adapterToUse.date('2018-03-16'));
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['maxDate', 'maxDate']);
      testInvalidStatus([true, true], fieldType);
    });

    it.skipIf(!withTime)('should apply minTime', () => {
      const onErrorMock = spy();
      render(
        <ElementToTest onError={onErrorMock} minTime={adapterToUse.date('2018-03-10T12:00:00')} />,
      );

      act(() => {
        [
          adapterToUse.date('2018-03-10T09:00:00'),
          adapterToUse.date('2018-03-10T10:00:00'),
        ].forEach((date, index) => {
          setValue(date, { setEndDate: index === 1 });
        });
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minTime', 'minTime']);
      testInvalidStatus([true, true], fieldType);

      act(() => {
        setValue(adapterToUse.date('2018-03-10T12:10:00'), { setEndDate: true });
      });

      expect(onErrorMock.callCount).to.equal(3);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minTime', null]);
      testInvalidStatus([true, false], fieldType);

      act(() => {
        setValue(adapterToUse.date('2018-03-10T12:05:00'));
      });

      expect(onErrorMock.callCount).to.equal(4);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });

    it.skipIf(!withTime)('should apply maxTime', () => {
      const onErrorMock = spy();
      render(
        <ElementToTest onError={onErrorMock} maxTime={adapterToUse.date('2018-03-10T12:00:00')} />,
      );

      act(() => {
        [
          adapterToUse.date('2018-03-10T09:00:00'),
          adapterToUse.date('2018-03-10T12:15:00'),
        ].forEach((date, index) => {
          setValue(date, { setEndDate: index === 1 });
        });
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'maxTime']);
      testInvalidStatus([false, true], fieldType);

      act(() => {
        setValue(adapterToUse.date('2018-03-10T12:05:00'));
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['maxTime', 'maxTime']);
      testInvalidStatus([true, true], fieldType);
    });
  });
};
