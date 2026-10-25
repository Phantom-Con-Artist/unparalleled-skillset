const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatDate = (iso) => fmt.format(new Date(`${iso}T12:00:00`));
