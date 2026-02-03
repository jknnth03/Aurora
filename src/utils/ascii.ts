/**
 * Single //console.log() Colored ASCII Art
 *
 * >>> characters: #ffc936 (yellow/gold)
 * ||| characters: #f37925 (orange)
 * --- characters: #ffc936 (yellow/gold)
 *
 * Displays the entire ASCII art with a single //console.log() call
 */

// ASCII art content
const asciiArt = `

                        ||                           
                        ||                           
                       ||||                          
                       ||||                          
                      ||||||                         
                      ||||||                         
                      |||||||                        
                     |||||||||                       
                 >   |||| ||||                       
                >>  |||||  ||||||||||                  
               >>>  ||||    ||||||||                
              >>>   ||||   |||||||   >>              
             >>>>  ||||  |||||||   >>>>>             
            >>>>   ||||||||||   >>>>>>>>>            
           >>>>>  |||||||||  >>>>>>>>>>>>>           
          >>>>>>  ||||||   >>>>>>>>>>>>>>>>          
         >>>>>>  |||||  >>>>>>>>>>>>>>>>>>>>         
        >>>>>>>  ||   >>>>>>>>>>>>>>>>>>>>>>>        
       >>>>>>>>    >>>>>>>>>>>>>>>>>>>>>>>>>>>       
      >>>>>>>>   >>>>>>>>>>>>>>>>    >>>>>>>>>>      
     >>>>>>>>>>>>>>>>>>>>>>>>>>      >>>>>>>>>>>     
    >>>>>>>>>>>>>>>>>>>>>>>>          >>>>>>>>>>>    
   >>>>>>>>>>>>>>>>>>>>>>>             >>>>>>>>>>>   
  >>>>>>>>>>>>>>>>>>>>>                 >>>>>>>>>>>  
 >>>>>>>>>>>>>>>>>>>>                    >>>>>>>>>>  
>>>>>>>>>>>>>>>>>>                        >>>>>>>>>> 
>>>>>>>>>>>>>>>>                           >>>>>>>>>>
>>>>>>>>>>>>>                               >>>>>>>>>
>>>>>>>>>>>                                  >>>>>>>>
  >>>>>>                                       >>>>  
                                                     
                                                     
        --  --    - -----   ----   -----   --        
       - -  --   -- --  -- -    -- -   --  - -       
      ----- --   -- -----  -    -- -----  -----      
     --   -- -----  --  --  -----  -   ----   --     
	 
	 `;

// Colors
const ORANGE = "#f37925";
const YELLOW = "#ffc936";

// Function to detect environment (browser or Node.js)
function isNode() {
	return typeof window === "undefined";
}

// Function to colorize the entire ASCII art in a single //console.log() call
export function displayAsciiArt() {
	if (isNode()) {
		// Node.js terminal approach - use ANSI escape codes
		const orangeStart = `\x1b[38;2;${parseInt(ORANGE.slice(1, 3), 16)};${parseInt(
			ORANGE.slice(3, 5),
			16
		)};${parseInt(ORANGE.slice(5, 7), 16)}m`;
		const yellowStart = `\x1b[38;2;${parseInt(YELLOW.slice(1, 3), 16)};${parseInt(
			YELLOW.slice(3, 5),
			16
		)};${parseInt(YELLOW.slice(5, 7), 16)}m`;
		const colorReset = "\x1b[0m";

		let coloredArt = "";

		for (let i = 0; i < asciiArt.length; i++) {
			const char = asciiArt[i];
			if (char === ">") {
				coloredArt += yellowStart + char + colorReset;
			} else if (char === "|") {
				coloredArt += orangeStart + char + colorReset;
			} else if (char === "-") {
				coloredArt += yellowStart + char + colorReset;
			} else {
				coloredArt += char;
			}
		}
		console.log(coloredArt);
	} else {
		// Browser console approach
		// We'll build one giant string with CSS styles for each character
		const lines = asciiArt.split("\n");
		const styles = [];
		let formatString = "";

		for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
			const line = lines[lineIndex];

			for (let charIndex = 0; charIndex < line.length; charIndex++) {
				const char = line[charIndex];
				formatString += "%c" + char;

				if (char === ">") {
					styles.push(`color: ${YELLOW}`);
				} else if (char === "|") {
					styles.push(`color: ${ORANGE}`);
				} else if (char === "-") {
					styles.push(`color: ${YELLOW}`);
				} else {
					styles.push("color: inherit");
				}
			}

			// Add newline if not the last line
			if (lineIndex < lines.length - 1) {
				formatString += "%c\n";
				styles.push("color: inherit");
			}
		}
		console.log(formatString, ...styles);
	}
}

// Export function for Node.js environments
if (isNode()) {
	module.exports = { displayAsciiArt };
}
