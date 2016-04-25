export default function callIfPresent(onCall, ...args) {
	return (onCall && typeof onCall === 'function') ? onCall(...args) : null;
}
