function truncateWithEllipsis(num, decimals = 4) {
  const factor = 10 ** decimals;
  const truncated = Math.trunc(num * factor) / factor;
  const wasTruncated = truncated !== num;
  const formatted = truncated.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
  return formatted + (wasTruncated ? '…' : '');
}

function getUniqueNameWithSuffix(existingNames, targetName) {
  if (!existingNames.includes(targetName)) {
    return targetName;
  }

  let counter = 1;
  let newName = `${targetName}_${counter}`;

  while (existingNames.includes(newName)) {
    counter++;
    newName = `${targetName}_${counter}`;
  }

  return newName;
}

export { truncateWithEllipsis, getUniqueNameWithSuffix }