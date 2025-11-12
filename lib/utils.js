function truncateWithEllipsis(num, decimals = 4) {
    const factor = 10 ** decimals;
    const truncated = Math.trunc(num * factor) / factor;
    const wasTruncated = truncated !== num;
    const formatted = truncated.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
    return formatted + (wasTruncated ? '…' : '');
}

export { truncateWithEllipsis }