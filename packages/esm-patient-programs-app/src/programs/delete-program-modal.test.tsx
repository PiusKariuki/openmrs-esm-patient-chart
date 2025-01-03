import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deleteProgramEnrollment, useEnrollments } from './programs.resource';
import DeleteProgramModal from './delete-program.modal';
import { showSnackbar } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';

jest.mock('./programs.resource', () => ({
  deleteProgramEnrollment: jest.fn(),
  useEnrollments: jest.fn(),
}));
jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
  getCoreTranslation: jest.fn((key, defaultText) => defaultText),
}));

const mockMutateEnrollments = jest.fn();
(useEnrollments as jest.Mock).mockImplementation(() => ({ mutateEnrollments: mockMutateEnrollments }));

const programEnrollmentId = '123';
const patientUuid = mockPatient.id;
const closeDeleteModalMock = jest.fn();

const renderDeleteProgramModal = () => {
  return render(
    <DeleteProgramModal
      closeDeleteModal={closeDeleteModalMock}
      programEnrollmentId={programEnrollmentId}
      patientUuid={patientUuid}
    />,
  );
};

describe('DeleteProgramModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with delete confirmation text ', () => {
    renderDeleteProgramModal();
    expect(screen.getByRole('heading', { name: /delete program enrollment/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this program enrollment?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('Calls closeDeleteModal when cancel button is clicked', async () => {
    renderDeleteProgramModal();
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(closeDeleteModalMock).toHaveBeenCalled();
  });

  it('handles delete action successfully', async () => {
    (deleteProgramEnrollment as jest.Mock).mockResolvedValue({ ok: true });
    renderDeleteProgramModal();
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await screen.findByText('Confirm');
    expect(deleteProgramEnrollment).toHaveBeenCalledWith(programEnrollmentId, expect.any(AbortController));
    expect(mockMutateEnrollments).toHaveBeenCalled();
    // expect(closeDeleteModalMock).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Program Enrollment Deleted',
    });
  });

  it('handles delete action error', async () => {
    const errorMessage = 'failed to delete';
    (deleteProgramEnrollment as jest.Mock).mockRejectedValue(new Error(errorMessage));

    renderDeleteProgramModal();
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await screen.findByText('Confirm');

    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      title: 'Error deleting program enrollment',
      subtitle: errorMessage,
    });
  });
});
