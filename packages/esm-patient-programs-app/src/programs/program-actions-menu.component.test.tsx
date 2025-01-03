import { showModal } from '@openmrs/esm-framework';
import { ProgramsActionsMenu } from './programs-actions-menu.component';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

jest.mock('@openmrs/esm-framework', () => ({
  showModal: jest.fn(),
  useLayoutType: jest.fn(() => 'desktop'),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  launchPatientWorkspace: jest.fn(),
}));

const testProps = {
  programEnrollmentId: '123',
  patientUuid: mockPatient.id,
};

const renderProgramActionsMenu = () => {
  return render(
    <ProgramsActionsMenu patientUuid={testProps.patientUuid} programEnrollmentId={testProps.programEnrollmentId} />,
  );
};

describe('ProgramActionsMenu', () => {
  const patientUuid = 'abc';
  const programEnrollmentId = '123';

  it('renders OverflowMenu with edit and delete actions', async () => {
    const user = userEvent.setup();
    renderProgramActionsMenu();

    const overFlowButton = screen.getByRole('button');
    await user.click(overFlowButton);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('launches edit program form when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderProgramActionsMenu();
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Edit'));

    expect(launchPatientWorkspace).toHaveBeenCalledWith('programs-form-workspace', { programEnrollmentId });
  });

  it('launches delete program dialog when delete option is clicked', async () => {
    const disposeMock = jest.fn();
    (showModal as jest.Mock).mockReturnValue(disposeMock);

    const user = userEvent.setup();
    renderProgramActionsMenu();

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Delete'));

    expect(showModal).toHaveBeenCalledWith('program-delete-confirmation-modal', {
      closeDeleteModal: expect.any(Function),
      patientUuid,
      programEnrollmentId,
    });

    /**
     * Simulation for creating the dispose function
     */
    const { closeDeleteModal } = (showModal as jest.Mock).mock.calls[0][1];
    closeDeleteModal();
    expect(disposeMock).toHaveBeenCalled();
  });
});
