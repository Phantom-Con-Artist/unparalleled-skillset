# Forms that tell the truth

Use a visible label connected by `for` and `id`, a suitable input type, autocomplete where appropriate, and persistent context instead of placeholder-only instructions. Connect hints and errors through `aria-describedby`; use `aria-invalid` when validation fails. Mark required fields in a way people can understand without color alone.

Validate at a time that helps the user rather than interrupting every keystroke. Preserve entered values after a failed submission, identify the field and problem in ordinary words, and offer a recoverable next step. If an error summary is useful, link it to the affected fields with clear names and keep its presentation free of decorative bullet markers.

Native `disabled` controls cannot receive focus and are not submitted. Read-only values remain available for selection and submission when supported by the control. `aria-disabled` requires an activation guard. Loading state must prevent accidental repeated submission and tell the user what is happening.

Use human copy rather than blame, jokes, buzzwords, or em-dash-heavy explanations. Keep buttons specific about their action and any consequence. Test keyboard order, focus after errors, server failures, long values, narrow layouts, and text enlargement. Do not shrink labels to maintain a decorative composition.
