#!/usr/bin/env php
<?php

echo T_PUBLIC . "\n";

$inputFile = null;
$keepNamespace = false; // по умолчанию сохраняем namespace

// Парсим аргументы
for ($i = 1; $i < $argc; $i++) {
    if (strpos($argv[$i], '-sns=') === 0) {
        $keepNamespace = (bool)substr($argv[$i], 5);
    } else {
        $inputFile = $argv[$i];
    }
}

if (!$inputFile) {
    die("Error: No input file specified.\n");
}

if (!file_exists($inputFile)) {
    die("Error: File '$inputFile' not found.\n");
}

$content = file_get_contents($inputFile);
$tokens = token_get_all($content);

//print_r($tokens);

$classes = [];
$currentClass = null;
$output = '';
$namespace = '';

// Parse the file
for ($i = 0; $i < count($tokens); $i++) {
    $token = $tokens[$i];
    
    if (is_array($token)) {
        switch ($token[0]) {
            case T_NAMESPACE:
                // Capture namespace
                $namespace = '';
                for ($j = $i + 1; $j < count($tokens); $j++) {
                    if (is_array($tokens[$j]) && $tokens[$j][0] === T_STRING) {
                        $namespace .= $tokens[$j][1] . '\\';
                    } elseif ($tokens[$j] === ';' || $tokens[$j] === '{') {
                        $namespace = rtrim($namespace, '\\');
                        $i = $j;
                        break;
                    }
                }
                break;
                
            case T_CLASS:
                // Start capturing class info
                $className = '';
                for ($j = $i + 1; $j < count($tokens); $j++) {
                    if (is_array($tokens[$j]) && $tokens[$j][0] === T_STRING) {
                        $className = $tokens[$j][1];
                        $i = $j;
                        break;
                    }
                }
                
                if ($className) {
                    $currentClass = [
                        'name' => $className,
                        'methods' => [],
                        'properties' => [],
                        'constants' => []
                    ];
                    $classes[] = &$currentClass;
                }
                break;
                
            case T_CONST:
                if ($currentClass) {
                    $constName = '';
                    for ($j = $i + 1; $j < count($tokens); $j++) {
                        if (is_array($tokens[$j]) && $tokens[$j][0] === T_STRING) {
                            $constName = $tokens[$j][1];
                            $currentClass['constants'][] = $constName;
                            $i = $j;
                            break;
                        }
                    }
                }
                break;
                
            case T_PUBLIC:
				echo "Found public\n";
                // Check if next token is a function or variable
                $nextToken = $tokens[$i + 1] ?? null;
                $nextNextToken = $tokens[$i + 2] ?? null;
                $nextToken3 = $tokens[$i + 4] ?? null;
                
                if ($currentClass) {
					echo "Found public and in currentClass `" . print_r($currentClass, true) . "`\n";
					
					print_r($nextToken);
					print_r($nextNextToken);
					print_r($nextToken3);
					
                    if (is_array($nextToken) && $nextNextToken[0] === T_FUNCTION) {
						echo "Found public and in currentClass `$currentClass` and next is function\n";
                        // It's a method
                        $methodName = '';
                        for ($j = $i + 2; $j < count($tokens); $j++) {
                            if (is_array($tokens[$j]) && $tokens[$j][0] === T_STRING) {
                                $methodName = $tokens[$j][1];
                                
                                // Find parameters
                                $params = '';
                                $bracketCount = 0;
                                $paramStart = false;
                                for ($k = $j + 1; $k < count($tokens); $k++) {
                                    if ($tokens[$k] === '(') {
                                        $bracketCount++;
                                        $paramStart = true;
                                    } elseif ($tokens[$k] === ')') {
                                        $bracketCount--;
                                        if ($bracketCount === 0) {
                                            $i = $k;
                                            echo "bracketCount === 0, break\n";
                                            break;
                                        }
                                    }
                                    
                                    if ($paramStart) {
                                        if (is_array($tokens[$k])) {
                                            $params .= $tokens[$k][1];
                                        } else {
                                            $params .= $tokens[$k];
                                        }
                                    }
                                }
                                
                                echo "Add method $methodName($params)\n";
                                $currentClass['methods'][] = [
                                    'name' => $methodName,
                                    'params' => $params
                                ];
                                break;
                            }
                        }
                    } elseif (is_array($nextToken3) && $nextToken3[0] === T_VARIABLE) {
                        // It's a property
                        $type = $nextNextToken[1] ?? 0;
                        $propertyName = $nextToken3[1];
                        $currentClass['properties'][] = $type . ' ' . $propertyName;
                        $i++;
                    } elseif ($nextToken === 'static' && is_array($nextNextToken) && $nextNextToken[0] === T_VARIABLE) {
                        // Static property
                        $propertyName = $nextNextToken[1];
                        $currentClass['properties'][] = $propertyName;
                        $i += 2;
                    }
                }
                break;
        }
    }
}

// Check classes found
if (count($classes) === 0) {
    die("Warning: No PHP class found in the file.\n");
} elseif (count($classes) > 1) {
    die("Warning: More than one class found in the file. Only the first one will be processed.\n");
}

$class = $classes[0];
$className = $class['name'];
$interfaceName = 'I' . $className;

// Determine output file name
$outputFile = dirname($inputFile) . '/' . $interfaceName . '.php';
if (file_exists($outputFile)) {
    echo "File $outputFile already exists. Overwrite? (y/n): ";
    $answer = trim(fgets(STDIN));
    if (strtolower($answer) !== 'y') {
        die("Operation canceled.\n");
    }
}

// Generate interface code
$output = "<?php\n\n";
if ($namespace && $keepNamespace) {
    $output .= "namespace $namespace;\n\n";
}

$output .= "interface $interfaceName\n{\n";

// Add constants
foreach ($class['constants'] as $constant) {
    $output .= "    public const $constant;\n";
}

if (!empty($class['constants'])) {
    $output .= "\n";
}

// Add properties
foreach ($class['properties'] as $property) {
    $output .= "    public $property;\n";
}

if (!empty($class['properties'])) {
    $output .= "\n";
}

// Add methods
foreach ($class['methods'] as $method) {
    $output .= "    public function {$method['name']}{$method['params']});\n";
}

$output .= "}\n";

// Write to file
file_put_contents($outputFile, $output);
echo "Interface $interfaceName created in $outputFile\n";
