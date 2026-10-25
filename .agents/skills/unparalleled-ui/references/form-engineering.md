# Form Engineering: Inputs, Validation & Error States

Forms are where users input intent into the software. A form with weak feedback causes errors, abandonments, and frustration.

---

## 1. Form Field Invariants

1. **Always Connect Labels to Inputs**:
   - Every input must have `<label for="field-id">` matching `<input id="field-id">`. Never rely on `placeholder` as a label.
2. **Help & Error Text Association**:
   - Connect helper text with `aria-describedby="field-help"`.
   - When an error occurs, set `aria-invalid="true"` and update `aria-describedby` to include the error message id.
3. **Focus States**:
   - Inputs must exhibit a clear, crisp focus ring (`border-color: var(--border-focus); outline: 2px solid var(--focus-ring); outline-offset: 1px`).
4. **Disabled vs Read-Only**:
   - `disabled`: Form data is NOT submitted, element cannot receive focus.
   - `readonly`: Data IS submitted, element can receive focus and text can be copied, but cannot be edited.

---

## 2. Standard Form Field HTML Recipe

```html
<div class="form-group">
  <label for="cluster-name" class="form-label">
    Cluster Name
    <span class="required-indicator" aria-hidden="true">*</span>
  </label>
  <input
    type="text"
    id="cluster-name"
    name="cluster_name"
    class="input-text"
    placeholder="e.g. prod-us-east-1"
    required
    aria-required="true"
    aria-describedby="cluster-name-hint"
  />
  <p id="cluster-name-hint" class="form-hint">
    Lowercase alphanumeric characters and dashes only.
  </p>
  <!-- When error state occurs: -->
  <!-- <p id="cluster-name-error" class="form-error" role="alert">Cluster name is already taken.</p> -->
</div>
```
