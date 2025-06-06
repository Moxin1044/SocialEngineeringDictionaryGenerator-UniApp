// utils/passwordUtil.js
export function getUpper(l) {
	const upperPattern = /.*[a-z].*/;
	return l.concat(l.map(i => upperPattern.test(i) ? i.toUpperCase() : '')).filter(Boolean);
}
export function getLower(l) {
	const lowerPattern = /.*[A-Z].*/;
	return l.concat(l.map(i => lowerPattern.test(i) ? i.toLowerCase() : '')).filter(Boolean);
}
export function getCapitalize(l) {
	const capitalizePattern = /^[a-z].*/;
	return l.concat(l.map(i => capitalizePattern.test(i) ? i.replace(/( |^)[a-z]/g, L => L.toUpperCase()) : '')).filter(
		Boolean);
}
export function getDistinctList(l) {
	return Array.from(new Set(l)).filter(Boolean);
}
export function getRepeat(l, x = 3) {
	const lr = l.map(i => (i.length > 0 && i.length <= x) ? i + i : '');
	return l.concat(lr).filter(Boolean);
}
export function getHeadTail(s, ...lens) {
	const result = [s];
	lens.forEach(i => {
		if (s.length > i) {
			result.push(s.substring(0, i), s.substring(s.length - i));
		}
	});
	return result.filter(Boolean);
}
export function dropShortLong(l, start = 6, end = 16) {
	return l.filter(i => (!start || i.length >= start) && (!end || i.length <= end));
}
export function dropStringInt(l, type) {
	const pattern = type === 'str' ? /^[a-zA-Z]+$/ : /^[0-9]+$/;
	return l.filter(i => !pattern.test(i));
}
export function calcDescartes(arr) {
	if (arr.length < 2) return arr[0] || [];
	return arr.reduce((total, current) => {
		let res = [];
		total.forEach(t => {
			current.forEach(c => res.push([t, c]));
		});
		return res;
	});
}
export function permutations(arr, size) {
	let result = [];

	function _combine(selected, left, count) {
		if (count === 0) {
			result.push(selected);
			return;
		}
		for (let i = 0; i < left.length; i++) {
			_combine([...selected, left[i]], left.slice(0, i).concat(left.slice(i + 1)), count - 1);
		}
	}
	_combine([], arr, size);
	return result;
}