import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { deleteProgramEnrollment, useEnrollments } from './programs.resource';
import DeleteProgramModal from './delete-program.modal';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
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
const mockDeleteProgramEnrollment = jest.mocked(deleteProgramEnrollment);
const mockShowSnackbar = jest.mocked(showSnackbar);
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

  it('clicking the delete button deletes the program enrollment', async () => {
    const user = userEvent.setup();
    mockDeleteProgramEnrollment.mockResolvedValue({ ok: true } as unknown as FetchResponse);
    renderDeleteProgramModal();
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(mockDeleteProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockDeleteProgramEnrollment).toHaveBeenCalledWith(programEnrollmentId, expect.any(AbortController));
    expect(mockDeleteProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockDeleteProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: expect.stringMatching(/program enrollment deleted/i),
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
