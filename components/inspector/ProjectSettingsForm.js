import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { beatsToMusicalTimeString } from '@/lib/timeUtils';
import { GearIcon } from '@phosphor-icons/react';
import IconText from '../IconText';

export default function ProjectSettingsForm({ project, snapshot }) {
    const {
        register,
        reset,
        getValues,
        trigger,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: project.meta.title,
            bpm: project.meta.bpm,
            width: project.meta.width,
            height: project.meta.height,
            fps: project.meta.fps
        }
    });

    // Function to update project metadata
    const updateProjectMeta = async (fieldName) => {
        const isValid = await trigger(fieldName);
        if (isValid) {
            const values = getValues();
            switch (fieldName) {
                case 'title':
                    project.meta.title = values.title;
                    break;
                case 'bpm':
                    project.meta.bpm = parseInt(values.bpm);
                    break;
                case 'width':
                    project.meta.width = parseInt(values.width);
                    break;
                case 'height':
                    project.meta.height = parseInt(values.height);
                    break;
                case 'fps':
                    project.meta.fps = parseInt(values.fps);
                    break;
            }
        }
    };

    // Handle blur and enter key events
    const handleBlur = (fieldName) => {
        updateProjectMeta(fieldName);
    };

    const handleKeyDown = (e, fieldName) => {
        if (e.key === 'Enter') {
            e.target.blur(); // This will trigger onBlur
        }
    };

    // Reset form when project changes
    useEffect(() => {
        reset({
            title: project.meta.title,
            bpm: project.meta.bpm,
            width: project.meta.width,
            height: project.meta.height,
            fps: project.meta.fps
        });
    }, [project, reset]);

    return (
        <div>
            <IconText as="h3" icon={GearIcon}>Project Settings</IconText>
            <div>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        {...register("title", {
                            required: "Title is required",
                            maxLength: {
                                value: 100,
                                message: "Title must be less than 100 characters"
                            }
                        })}
                        onBlur={() => handleBlur('title')}
                        onKeyDown={(e) => handleKeyDown(e, 'title')}
                    />
                    {errors.title && <span className="error">{errors.title.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="bpm">BPM</label>
                    <input
                        id="bpm"
                        type="number"
                        {...register("bpm", {
                            required: "BPM is required",
                            min: { value: 60, message: "BPM must be at least 60" },
                            max: { value: 200, message: "BPM must be no more than 200" }
                        })}
                        onBlur={() => handleBlur('bpm')}
                        onKeyDown={(e) => handleKeyDown(e, 'bpm')}
                    />
                    {errors.bpm && <span className="error">{errors.bpm.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="width">Width (px)</label>
                    <input
                        id="width"
                        type="number"
                        {...register("width", {
                            required: "Width is required",
                            min: { value: 100, message: "Width must be at least 100px" },
                            max: { value: 4000, message: "Width must be no more than 4000px" }
                        })}
                        onBlur={() => handleBlur('width')}
                        onKeyDown={(e) => handleKeyDown(e, 'width')}
                    />
                    {errors.width && <span className="error">{errors.width.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="height">Height (px)</label>
                    <input
                        id="height"
                        type="number"
                        {...register("height", {
                            required: "Height is required",
                            min: { value: 100, message: "Height must be at least 100px" },
                            max: { value: 4000, message: "Height must be no more than 4000px" }
                        })}
                        onBlur={() => handleBlur('height')}
                        onKeyDown={(e) => handleKeyDown(e, 'height')}
                    />
                    {errors.height && <span className="error">{errors.height.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="fps">Frame Rate (FPS)</label>
                    <input
                        id="fps"
                        type="number"
                        {...register("fps", {
                            required: "FPS is required",
                            min: { value: 12, message: "FPS must be at least 12" },
                            max: { value: 120, message: "FPS must be no more than 120" }
                        })}
                        onBlur={() => handleBlur('fps')}
                        onKeyDown={(e) => handleKeyDown(e, 'fps')}
                    />
                    {errors.fps && <span className="error">{errors.fps.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="snap">Snap</label>
                    <select
                        id="snap"
                        value={snapshot.snap}
                        onChange={(e) => {
                            project.snap = parseFloat(e.target.value);
                        }}
                    >
                        {[4, 1, 0.5, 1 / 3, 0.25, 0.125].map(value => (
                            <option key={value} value={value}>
                                {beatsToMusicalTimeString(value)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}